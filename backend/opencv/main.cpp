#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <filesystem>
#include <fstream>
#include <nlohmann/json.hpp>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <regex>

using namespace std;
using namespace cv;
namespace fs = std::filesystem;
using json = nlohmann::json;

// 결과를 저장할 구조체
struct ParkingResult {
    string test_image_name;
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

// 파일명에서 CCTV ID 추출 (예: P1_B2_3_1_Current.jpg -> P1_B2_3_1)
string extract_cctv_id_from_filename(const string& filename) {
    regex pattern(R"(([A-Z]\d+_[A-Z]\d+_\d+_\d+)_Current\.jpg)");
    smatch match;
    if (regex_search(filename, match, pattern)) {
        return match[1].str();
    }
    return "";
}

vector<vector<Point>> get_rois_from_json(const string& json_path, const string& cctv_id) {
    cout << "JSON 파일 경로: " << json_path << endl;
    cout << "찾는 CCTV ID: " << cctv_id << endl;
    
    ifstream ifs(json_path);
    if (!ifs.is_open()) {
        cerr << "JSON 파일을 열 수 없습니다: " << json_path << endl;
        return {};
    }
    json j;
    ifs >> j;
    
    vector<vector<Point>> rois;
    bool found_cctv = false;
    
    cout << "JSON 파일의 모든 키:" << endl;
    for (auto& [ip, cctvData] : j.items()) {
        cout << "  IP: " << ip << ", CCTV ID: " << cctvData["cctv_id"] << endl;
        
        if (cctvData["cctv_id"] == cctv_id) {
            found_cctv = true;
            cout << "CCTV ID 매칭 발견: " << cctv_id << endl;
            
            // 해당 CCTV의 ROI를 가져오기
            for (const auto& match : cctvData["matches"]) {
                cout << "매치 항목 처리 중..." << endl;
                
                // img_center_roi 사용 (original_roi 대신)
                auto roi_arr = match["img_center_roi"];
                cout << "ROI 배열 크기: " << roi_arr.size() << endl;
                
                vector<Point> roi;
                
                // 좌표 배열을 Point로 변환 (x, y 쌍으로)
                for (size_t i = 0; i + 1 < roi_arr.size(); i += 2) {
                    int x = roi_arr[i];
                    int y = roi_arr[i + 1];
                    roi.emplace_back(x, y);
                    cout << "  좌표 " << (i/2 + 1) << ": (" << x << ", " << y << ")" << endl;
                }
                
                if (!roi.empty()) {
                    rois.push_back(roi);
                    cout << "ROI 추가됨, 크기: " << roi.size() << endl;
                } else {
                    cout << "ROI가 비어있음" << endl;
                }
            }
            break; // 해당 CCTV를 찾았으므로 루프 종료
        }
    }
    
    if (!found_cctv) {
        cerr << "해당 CCTV ID를 찾을 수 없습니다: " << cctv_id << endl;
    } else if (rois.empty()) {
        cerr << "해당 CCTV의 ROI를 찾을 수 없습니다: " << cctv_id << endl;
    } else {
        cout << "총 " << rois.size() << "개의 ROI를 찾았습니다." << endl;
        // ROI 좌표 출력 (디버깅용)
        for (size_t i = 0; i < rois.size(); i++) {
            cout << "ROI " << (i+1) << " 좌표: ";
            for (const auto& point : rois[i]) {
                cout << "(" << point.x << ", " << point.y << ") ";
            }
            cout << endl;
        }
    }
    
    return rois;
}

ParkingResult process_single_test_image(const string& test_image_path, double learning_rate, int iterations, 
                                      double var_threshold, const string& learning_base_path, 
                                      const string& roi_path) {
    ParkingResult result;
    result.test_image_name = fs::path(test_image_path).filename().string();
    result.learning_rate = learning_rate;
    result.iterations = iterations;
    result.var_threshold = var_threshold;
    result.learning_path = learning_base_path;
    result.test_image_path = test_image_path;
    result.roi_path = roi_path;
    result.timestamp = get_current_timestamp();
    
    // 파일명에서 CCTV ID 추출
    string cctv_id = extract_cctv_id_from_filename(result.test_image_name);
    if (cctv_id.empty()) {
        cerr << "CCTV ID를 추출할 수 없습니다: " << result.test_image_name << endl;
        return result;
    }
    result.cctv_id = cctv_id;
    
    cout << "\n=== 테스트 이미지 처리 시작 ===" << endl;
    cout << "테스트 이미지: " << result.test_image_name << endl;
    cout << "CCTV ID: " << cctv_id << endl;
    
    // 해당 CCTV의 학습 폴더 경로
    string learning_folder_path = fs::path(learning_base_path) / "learningBackImg" / cctv_id;
    if (!fs::exists(learning_folder_path)) {
        cerr << "학습 폴더를 찾을 수 없습니다: " << learning_folder_path << endl;
        return result;
    }
    cout << "학습 폴더: " << learning_folder_path << endl;
    
    // 1️⃣ MOG2 초기화
    int history = 500;
    bool detectShadows = false;
    Ptr<BackgroundSubtractor> mog2 = createBackgroundSubtractorMOG2(history, var_threshold, detectShadows);

    // 2️⃣ 학습용 이미지로 배경 모델 학습
    cout << "학습 시작... (반복 횟수: " << iterations << ")\n";
    int learning_count = 0;
    Mat frame, fgMask;
    
    for (int epoch = 0; epoch < iterations; ++epoch) {
        for (const auto& entry : fs::directory_iterator(learning_folder_path)) {
            if (entry.is_regular_file()) {
                string ext = entry.path().extension().string();
                if (ext == ".jpg" || ext == ".jpeg" || ext == ".png") {
                    frame = imread(entry.path().string());
                    if (frame.empty()) continue;
                    mog2->apply(frame, fgMask, learning_rate);
                    learning_count++;
                    if (learning_count % 10 == 0) {
                        cout << "학습 진행: " << learning_count << "개 이미지 처리됨" << endl;
                    }
                }
            }
        }
    }
    cout << "총 " << learning_count << "개 이미지로 학습 완료" << endl;

    // 3️⃣ 테스트 이미지 로드
    Mat testImg = imread(test_image_path);
    if (testImg.empty()) {
        cerr << "테스트 이미지를 열 수 없습니다: " << test_image_path << endl;
        return result;
    }

    // 4️⃣ MOG2 적용 (테스트 시 learningRate = 0)
    mog2->apply(testImg, fgMask, 0);

    // 5️⃣ Morphology 후처리
    Mat kernel = getStructuringElement(MORPH_RECT, Size(7,7));
    morphologyEx(fgMask, fgMask, MORPH_OPEN, kernel);
    morphologyEx(fgMask, fgMask, MORPH_CLOSE, kernel);

    // 6️⃣ 해당 CCTV의 ROI 정보 JSON에서 읽기
    vector<vector<Point>> rois = get_rois_from_json(roi_path, cctv_id);
    if (rois.empty()) {
        cout << "ROI가 비어있어서 처리 중단" << endl;
        return result;
    }

    // 7️⃣ 각 ROI별 foreground 비율 계산
    cout << "\n=== ROI별 Foreground 비율 ===" << endl;
    cout << "테스트 이미지 크기: " << testImg.cols << "x" << testImg.rows << endl;
    cout << "Foreground 마스크 크기: " << fgMask.cols << "x" << fgMask.rows << endl;
    
    for (size_t i = 0; i < rois.size(); i++) {
        cout << "\nROI " << (i+1) << " 처리 중..." << endl;
        
        // ROI 마스크 생성
        Mat roiMask = Mat::zeros(fgMask.size(), CV_8UC1);
        fillPoly(roiMask, vector<vector<Point>>{rois[i]}, Scalar(255));
        
        // ROI 마스크에서 흰색 픽셀 수 확인
        int roiTotalPixels = countNonZero(roiMask);
        cout << "ROI " << (i+1) << " 총 픽셀 수: " << roiTotalPixels << endl;
        
        if (roiTotalPixels == 0) {
            cout << "ROI " << (i+1) << " 마스크가 비어있음" << endl;
            continue;
        }
        
        // Foreground와 ROI 마스크 교집합
        Mat maskedFG;
        bitwise_and(fgMask, roiMask, maskedFG);
        
        // Foreground 픽셀 수 계산
        int foregroundPixels = countNonZero(maskedFG);
        double ratio = roiTotalPixels > 0 ? (double)foregroundPixels / roiTotalPixels : 0.0;
        
        cout << "ROI " << (i+1) << ": " << ratio << " (" << foregroundPixels << "/" << roiTotalPixels << ")" << endl;
        
        // 결과에 추가
        result.roi_results.push_back({static_cast<int>(i+1), ratio});
    }
    
    cout << "총 " << result.roi_results.size() << "개의 ROI 결과 추가됨" << endl;

    return result;
}

void save_result_to_json(const vector<ParkingResult>& results, const string& output_dir) {
    // 출력 디렉토리 생성
    fs::create_directories(output_dir);
    
    // JSON 파일명 생성
    string filename = output_dir + "/" + get_current_timestamp() + "_parking_results.json";
    
    // JSON 객체 생성
    json j;
    json results_array = json::array();
    
    for (const auto& result : results) {
        json result_obj;
        result_obj["test_image_name"] = result.test_image_name;
        result_obj["cctv_id"] = result.cctv_id;
        result_obj["timestamp"] = result.timestamp;
        result_obj["var_threshold"] = result.var_threshold;
        result_obj["learning_rate"] = result.learning_rate;
        result_obj["iterations"] = result.iterations;
        result_obj["learning_path"] = result.learning_path;
        result_obj["test_image_path"] = result.test_image_path;
        result_obj["roi_path"] = result.roi_path;
        
        json roi_array = json::array();
        for (const auto& roi_result : result.roi_results) {
            json roi_obj;
            roi_obj["roi_index"] = roi_result.first;
            roi_obj["foreground_ratio"] = roi_result.second;
            roi_array.push_back(roi_obj);
        }
        result_obj["roi_results"] = roi_array;
        
        results_array.push_back(result_obj);
    }
    
    j["results"] = results_array;
    j["total_tests"] = results.size();
    
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
    if (argc != 8) {
        cout << "사용법: " << argv[0] << " <learning_rate> <iterations> <var_threshold> <project_id> <learning_base_path> <test_images_path> <roi_path>" << endl;
        cout << "예시: " << argv[0] << " 0.01 1000 0.5 banpo /path/to/learning /path/to/test_images /path/to/roi.json" << endl;
        return 1;
    }
    
    double learning_rate = stod(argv[1]);
    int iterations = stoi(argv[2]);
    double var_threshold = stod(argv[3]);
    string project_id = argv[4];
    string learning_base_path = argv[5];
    string test_images_path = argv[6];
    string roi_path = argv[7];
    
    cout << "=== 주차 감지 알고리즘 시작 ===" << endl;
    cout << "Learning Rate: " << learning_rate << endl;
    cout << "Iterations: " << iterations << endl;
    cout << "Var Threshold: " << var_threshold << endl;
    cout << "Project ID: " << project_id << endl;
    cout << "Learning Base Path: " << learning_base_path << endl;
    cout << "Test Images Path: " << test_images_path << endl;
    cout << "ROI Path: " << roi_path << endl;
    
    // 테스트 이미지 폴더 확인
    if (!fs::exists(test_images_path)) {
        cerr << "테스트 이미지 폴더를 찾을 수 없습니다: " << test_images_path << endl;
        return 1;
    }
    
    vector<ParkingResult> all_results;
    
    // 모든 테스트 이미지 처리 (재귀적으로 검색)
    for (const auto& entry : fs::recursive_directory_iterator(test_images_path)) {
        if (entry.is_regular_file()) {
            string ext = entry.path().extension().string();
            if (ext == ".jpg" || ext == ".jpeg" || ext == ".png") {
                string filename = entry.path().filename().string();
                
                // _Current.jpg 파일만 처리
                if (filename.find("_Current.jpg") != string::npos) {
                    cout << "\n" << string(50, '=') << endl;
                    cout << "처리 중: " << filename << endl;
                    cout << "전체 경로: " << entry.path().string() << endl;
                    cout << string(50, '=') << endl;
                    
                    ParkingResult result = process_single_test_image(
                        entry.path().string(), learning_rate, iterations, var_threshold,
                        learning_base_path, roi_path
                    );
                    
                    if (!result.cctv_id.empty()) {
                        all_results.push_back(result);
                    }
                }
            }
        }
    }
    
    // 결과를 shared/{project_id}/results 폴더에 저장
    string output_dir = "../../shared/" + project_id + "/results/" + get_current_timestamp();
    save_result_to_json(all_results, output_dir);
    
    cout << "\n=== 주차 감지 알고리즘 완료 ===" << endl;
    cout << "총 " << all_results.size() << "개 테스트 이미지 처리 완료" << endl;
    return 0;
}
