#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <filesystem>
#include <fstream>
#include <nlohmann/json.hpp>
#include <chrono>
#include <iomanip>
#include <sstream>

using namespace std;
using namespace cv;
namespace fs = std::filesystem;
using json = nlohmann::json;

// 결과를 저장할 구조체
struct ParkingResult {
    string cctv_id;
    vector<pair<int, double>> roi_results; // ROI 인덱스와 foreground 비율
    string timestamp;
    double var_threshold;
    double learning_rate;
    int iterations;
    string learning_path;
    string test_image_path;
    string roi_path;
};

// 현재 시간을 문자열로 반환하는 함수
string get_current_timestamp() {
    auto now = chrono::system_clock::now();
    auto time_t = chrono::system_clock::to_time_t(now);
    auto ms = chrono::duration_cast<chrono::milliseconds>(now.time_since_epoch()) % 1000;
    
    stringstream ss;
    ss << put_time(localtime(&time_t), "%Y%m%d_%H%M%S");
    ss << "_" << setfill('0') << setw(3) << ms.count();
    return ss.str();
}

vector<vector<Point>> get_all_rois_from_json(const string& json_path, const string& cctv_id) {
    ifstream ifs(json_path);
    if (!ifs.is_open()) {
        cerr << "JSON 파일을 열 수 없습니다: " << json_path << endl;
        return {};
    }
    json j;
    ifs >> j;
    
    vector<vector<Point>> all_rois;
    
    for (auto& [ip, cctvData] : j.items()) {
        if (cctvData["cctv_id"] == cctv_id) {
            // 모든 ROI를 가져오기
            for (const auto& match : cctvData["matches"]) {
                auto roi_arr = match["original_roi"];
                vector<Point> roi;
                for (size_t i = 0; i + 1 < roi_arr.size(); i += 2) {
                    roi.emplace_back(roi_arr[i], roi_arr[i + 1]);
                }
                if (!roi.empty()) {
                    all_rois.push_back(roi);
                }
            }
            break; // 해당 CCTV를 찾았으므로 루프 종료
        }
    }
    
    if (all_rois.empty()) {
        cerr << "해당 CCTV의 ROI를 찾을 수 없습니다: " << cctv_id << endl;
    } else {
        cout << "총 " << all_rois.size() << "개의 ROI를 찾았습니다." << endl;
    }
    
    return all_rois;
}

ParkingResult process_test_image(double learning_rate, int iterations, double var_threshold, 
                               const string& learning_path, const string& test_image_path,
                               const string& roi_path) {
    ParkingResult result;
    result.learning_rate = learning_rate;
    result.iterations = iterations;
    result.var_threshold = var_threshold;
    result.learning_path = learning_path;
    result.test_image_path = test_image_path;
    result.roi_path = roi_path;
    result.timestamp = get_current_timestamp();
    
    // 1️⃣ MOG2 초기화
    int history = 500;
    bool detectShadows = false;
    Ptr<BackgroundSubtractor> mog2 = createBackgroundSubtractorMOG2(history, var_threshold, detectShadows);

    // 2️⃣ 학습용 이미지 경로 확인
    if (!fs::exists(learning_path)) {
        cerr << "학습용 이미지 폴더를 찾을 수 없습니다: " << learning_path << endl;
        return result;
    }

    // 🔥 학습 반복 횟수 (파라미터로 받은 값 사용)
    cout << "학습 시작... (반복 횟수: " << iterations << ")\n";
    int learning_count = 0;
    Mat frame, fgMask;
    
    for (int epoch = 0; epoch < iterations; ++epoch) {
        for (const auto& entry : fs::directory_iterator(learning_path)) {
            if (entry.is_regular_file()) {
                string ext = entry.path().extension().string();
                if (ext == ".jpg" || ext == ".jpeg" || ext == ".png") {
                    frame = imread(entry.path().string());
                    if (frame.empty()) continue;
                    mog2->apply(frame, fgMask, learning_rate); // 파라미터로 받은 learning_rate 사용
                    learning_count++;
                    if (learning_count % 10 == 0) {
                        cout << "학습 진행: " << learning_count << "개 이미지 처리됨" << endl;
                    }
                }
            }
        }
    }
    cout << "총 " << learning_count << "개 이미지로 학습 완료" << endl;

    // 4️⃣ 테스트 이미지 로드
    Mat testImg = imread(test_image_path);
    if (testImg.empty()) {
        cerr << "테스트 이미지를 열 수 없습니다: " << test_image_path << endl;
        return result;
    }

    // 5️⃣ MOG2 적용 (테스트 시 learningRate = 0)
    mog2->apply(testImg, fgMask, 0);

    // 6️⃣ Morphology 후처리
    Mat kernel = getStructuringElement(MORPH_RECT, Size(7,7));
    morphologyEx(fgMask, fgMask, MORPH_OPEN, kernel);
    morphologyEx(fgMask, fgMask, MORPH_CLOSE, kernel);

    // 7️⃣ 모든 ROI 정보 JSON에서 읽기
    vector<vector<Point>> allRois = get_all_rois_from_json(roi_path, "P1_B3_1_3"); // 기본 CCTV ID 사용
    if (allRois.empty()) return result;

    // 9️⃣ 각 ROI별 foreground 비율 계산
    cout << "\n=== ROI별 Foreground 비율 ===" << endl;
    for (size_t i = 0; i < allRois.size(); i++) {
        Mat roiMask = Mat::zeros(fgMask.size(), CV_8UC1);
        fillPoly(roiMask, vector<vector<Point>>{allRois[i]}, Scalar(255));
        Mat maskedFG;
        bitwise_and(fgMask, roiMask, maskedFG);
        double total = countNonZero(roiMask);
        double white = countNonZero(maskedFG);
        double ratio = total > 0 ? white / total : 0.0;
        cout << "ROI " << (i+1) << ": " << ratio << " (" << white << "/" << total << ")" << endl;
        
        // 결과에 추가
        result.roi_results.push_back({static_cast<int>(i+1), ratio});
    }

    return result;
}

void save_result_to_json(const ParkingResult& result, const string& output_dir) {
    // 출력 디렉토리 생성
    fs::create_directories(output_dir);
    
    // JSON 파일명 생성
    string filename = output_dir + "/" + result.timestamp + "_parking_result.json";
    
    // JSON 객체 생성
    json j;
    j["learning_rate"] = result.learning_rate;
    j["iterations"] = result.iterations;
    j["var_threshold"] = result.var_threshold;
    j["learning_path"] = result.learning_path;
    j["test_image_path"] = result.test_image_path;
    j["roi_path"] = result.roi_path;
    j["timestamp"] = result.timestamp;
    
    json roi_array = json::array();
    for (const auto& roi_result : result.roi_results) {
        json roi_obj;
        roi_obj["roi_index"] = roi_result.first;
        roi_obj["foreground_ratio"] = roi_result.second;
        roi_array.push_back(roi_obj);
    }
    j["roi_results"] = roi_array;
    
    // JSON 파일로 저장
    ofstream ofs(filename);
    if (ofs.is_open()) {
        ofs << j.dump(2);
        ofs.close();
        cout << "결과가 저장되었습니다: " << filename << endl;
    } else {
        cerr << "결과 파일을 저장할 수 없습니다: " << filename << endl;
    }
}

int main(int argc, char* argv[]) {
    if (argc != 7) {
        cout << "사용법: " << argv[0] << " <learning_rate> <iterations> <var_threshold> <learning_path> <test_path> <roi_path>" << endl;
        cout << "예시: " << argv[0] << " 0.01 1000 0.5 /path/to/learning /path/to/test.jpg /path/to/roi.json" << endl;
        return 1;
    }
    
    double learning_rate = stod(argv[1]);
    int iterations = stoi(argv[2]);
    double var_threshold = stod(argv[3]);
    string learning_path = argv[4];
    string test_path = argv[5];
    string roi_path = argv[6];
    
    cout << "=== 주차 감지 알고리즘 시작 ===" << endl;
    cout << "Learning Rate: " << learning_rate << endl;
    cout << "Iterations: " << iterations << endl;
    cout << "Var Threshold: " << var_threshold << endl;
    cout << "Learning Path: " << learning_path << endl;
    cout << "Test Path: " << test_path << endl;
    cout << "ROI Path: " << roi_path << endl;
    
    // 알고리즘 실행
    ParkingResult result = process_test_image(learning_rate, iterations, var_threshold, learning_path, test_path, roi_path);
    
    // 결과를 shared/results 폴더에 저장
    string output_dir = "../../shared/results/" + result.timestamp;
    save_result_to_json(result, output_dir);
    
    cout << "=== 주차 감지 알고리즘 완료 ===" << endl;
    return 0;
}
