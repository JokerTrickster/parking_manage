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
    ifstream ifs(json_path);
    if (!ifs.is_open()) {
        cerr << "JSON 파일을 열 수 없습니다: " << json_path << endl;
        return {};
    }
    json j;
    ifs >> j;
    
    vector<vector<Point>> rois;
    
    cout << "JSON 파일 로드 완료. CCTV ID 찾기: " << cctv_id << endl;
    
    for (auto& [ip, cctvData] : j.items()) {
        cout << "IP 키: " << ip << endl;
        cout << "CCTV ID: " << cctvData["cctv_id"] << endl;
        
        if (cctvData["cctv_id"] == cctv_id) {
            cout << "CCTV " << cctv_id << " 발견 (IP: " << ip << ")" << endl;
            
            // matches 배열에서 모든 ROI 추출
            for (const auto& match : cctvData["matches"]) {
                cout << "Match 객체 키들: ";
                for (const auto& [key, value] : match.items()) {
                    cout << key << " ";
                }
                cout << endl;
                
                // 다양한 필드명 시도
                json roi_arr;
                if (match.contains("original_roi")) {
                    roi_arr = match["original_roi"];
                    cout << "original_roi 필드 발견" << endl;
                } else if (match.contains("img_center_roi")) {
                    roi_arr = match["img_center_roi"];
                    cout << "img_center_roi 필드 발견" << endl;
                } else if (match.contains("roi")) {
                    roi_arr = match["roi"];
                    cout << "roi 필드 발견" << endl;
                } else {
                    cout << "ROI 필드를 찾을 수 없습니다. 사용 가능한 키들: ";
                    for (const auto& [key, value] : match.items()) {
                        cout << key << " ";
                    }
                    cout << endl;
                    continue;
                }
                
                vector<Point> roi;
                
                // ROI 좌표를 Point로 변환
                for (size_t i = 0; i + 1 < roi_arr.size(); i += 2) {
                    int x = roi_arr[i];
                    int y = roi_arr[i + 1];
                    roi.emplace_back(x, y);
                }
                
                if (!roi.empty()) {
                    rois.push_back(roi);
                    cout << "ROI 추가됨: " << roi.size() << "개 포인트" << endl;
                }
            }
            break; // 해당 CCTV를 찾았으므로 루프 종료
        }
    }
    
    if (rois.empty()) {
        cerr << "CCTV " << cctv_id << "의 ROI를 찾을 수 없습니다." << endl;
    } else {
        cout << "총 " << rois.size() << "개의 ROI를 찾았습니다." << endl;
    }
    
    return rois;
}

ParkingResult process_single_test_image(const string& test_image_path, double learning_rate, int iterations, 
                                      double var_threshold, const string& learning_base_path, 
                                      const string& roi_path, const string& output_dir) {
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
        return result;
    }
    result.cctv_id = cctv_id;
    
    // CCTV ID별 폴더 생성
    string cctv_output_dir = output_dir + "/" + cctv_id;
    fs::create_directories(cctv_output_dir);
    
    // 해당 CCTV의 학습 폴더 경로
    string learning_folder_path = fs::path(learning_base_path) / "learningBackImg" / cctv_id;
    if (!fs::exists(learning_folder_path)) {
        return result;
    }
    
    // 1️⃣ MOG2 초기화
    int history = 500;
    bool detectShadows = false;
    Ptr<BackgroundSubtractor> mog2 = createBackgroundSubtractorMOG2(history, var_threshold, detectShadows);

    // 2️⃣ 학습용 이미지로 배경 모델 학습
    Mat frame, fgMask;
    
    for (int epoch = 0; epoch < iterations; ++epoch) {
        for (const auto& entry : fs::directory_iterator(learning_folder_path)) {
            if (entry.is_regular_file()) {
                string ext = entry.path().extension().string();
                if (ext == ".jpg" || ext == ".jpeg" || ext == ".png") {
                    frame = imread(entry.path().string());
                    if (frame.empty()) continue;
                    mog2->apply(frame, fgMask, learning_rate);
                }
            }
        }
    }

    // 3️⃣ 테스트 이미지 로드
    Mat testImg = imread(test_image_path);
    if (testImg.empty()) {
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
        return result;
    }

    // 7️⃣ 각 ROI별 foreground 비율 계산 및 이미지 저장
    Mat roiImage = testImg.clone();
    Mat fgMaskColored;
    cvtColor(fgMask, fgMaskColored, COLOR_GRAY2BGR);
    
    for (size_t i = 0; i < rois.size(); i++) {
        // ROI 마스크 생성
        Mat roiMask = Mat::zeros(fgMask.size(), CV_8UC1);
        fillPoly(roiMask, vector<vector<Point>>{rois[i]}, Scalar(255));
        
        // ROI 마스크에서 흰색 픽셀 수 확인
        int roiTotalPixels = countNonZero(roiMask);
        
        if (roiTotalPixels == 0) {
            continue;
        }
        
        // Foreground와 ROI 마스크 교집합
        Mat maskedFG;
        bitwise_and(fgMask, roiMask, maskedFG);
        
        // Foreground 픽셀 수 계산
        int foregroundPixels = countNonZero(maskedFG);
        double ratio = roiTotalPixels > 0 ? (double)foregroundPixels / roiTotalPixels : 0.0;
        
        // ROI 경계선 그리기 (테스트 이미지에)
        Scalar roiColor = (ratio >= 0.4) ? Scalar(0, 255, 0) : Scalar(0, 0, 255); // 녹색(차량있음) 또는 빨간색(차량없음)
        polylines(roiImage, vector<vector<Point>>{rois[i]}, true, roiColor, 2);
        
        // ROI 중심점 계산
        Point center(0, 0);
        for (const auto& point : rois[i]) {
            center += point;
        }
        center.x /= rois[i].size();
        center.y /= rois[i].size();
        
        // ROI 번호와 비율 텍스트 표시 (소수점 3자리)
        stringstream ss;
        ss << fixed << setprecision(3) << ratio;
        string ratioText = "ROI" + to_string(i+1) + ": " + ss.str();
        
        int font = FONT_HERSHEY_SIMPLEX;
        double font_scale = 0.6;
        int thickness = 2;
        
        // 텍스트 배경 (가독성을 위해)
        Size text_size = getTextSize(ratioText, font, font_scale, thickness, nullptr);
        rectangle(roiImage, 
                 Point(center.x - text_size.width/2 - 5, center.y - text_size.height - 5),
                 Point(center.x + text_size.width/2 + 5, center.y + 5),
                 Scalar(0, 0, 0), -1);
        
        // 텍스트 그리기
        putText(roiImage, ratioText, 
                Point(center.x - text_size.width/2, center.y), 
                font, font_scale, Scalar(255, 255, 255), thickness);
        
        // Foreground 마스크에도 ROI 그리기
        polylines(fgMaskColored, vector<vector<Point>>{rois[i]}, true, roiColor, 2);
        
        // Foreground 마스크에도 텍스트 배경
        rectangle(fgMaskColored, 
                 Point(center.x - text_size.width/2 - 5, center.y - text_size.height - 5),
                 Point(center.x + text_size.width/2 + 5, center.y + 5),
                 Scalar(0, 0, 0), -1);
        
        // Foreground 마스크에도 텍스트 그리기
        putText(fgMaskColored, ratioText, 
                Point(center.x - text_size.width/2, center.y), 
                font, font_scale, Scalar(255, 255, 255), thickness);
        
        // 결과에 추가
        result.roi_results.push_back({static_cast<int>(i+1), ratio});
    }
    
    // 이미지 저장 (CCTV ID 폴더 안에)
    string roiImagePath = cctv_output_dir + "/roi_result.jpg";
    string fgMaskPath = cctv_output_dir + "/fgmask.jpg";
    
    bool roiSaved = imwrite(roiImagePath, roiImage);
    bool fgMaskSaved = imwrite(fgMaskPath, fgMaskColored);
    
    // 저장 결과 확인 (디버깅용)
    if (!roiSaved) {
        cerr << "ROI 이미지 저장 실패: " << roiImagePath << endl;
    }
    if (!fgMaskSaved) {
        cerr << "Foreground 마스크 저장 실패: " << fgMaskPath << endl;
    }

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
    }
}

int main(int argc, char* argv[]) {
    if (argc != 8) {
        cout << "사용법: " << argv[0] << " <learning_rate> <iterations> <var_threshold> <project_id> <learning_base_path> <test_images_path> <roi_path>" << endl;
        return 1;
    }
    
    double learning_rate = stod(argv[1]);
    int iterations = stoi(argv[2]);
    double var_threshold = stod(argv[3]);
    string project_id = argv[4];
    string learning_base_path = argv[5];
    string test_images_path = argv[6];
    string roi_path = argv[7];
    
    // 테스트 이미지 폴더 확인
    if (!fs::exists(test_images_path)) {
        cerr << "테스트 이미지 폴더를 찾을 수 없습니다: " << test_images_path << endl;
        return 1;
    }
    
    // 결과 디렉토리 생성
    string results_dir = "../../shared/" + project_id + "/results/" + get_current_timestamp();
    fs::create_directories(results_dir);
    
    vector<ParkingResult> all_results;
    
    // 모든 테스트 이미지 처리 (재귀적으로 검색)
    for (const auto& entry : fs::recursive_directory_iterator(test_images_path)) {
        if (entry.is_regular_file()) {
            string ext = entry.path().extension().string();
            if (ext == ".jpg" || ext == ".jpeg" || ext == ".png") {
                string filename = entry.path().filename().string();
                
                // _Current.jpg 파일만 처리
                if (filename.find("_Current.jpg") != string::npos) {
                    ParkingResult result = process_single_test_image(
                        entry.path().string(), learning_rate, iterations, var_threshold,
                        learning_base_path, roi_path, results_dir
                    );
                    
                    if (!result.cctv_id.empty()) {
                        all_results.push_back(result);
                    }
                }
            }
        }
    }
    
    // 결과를 shared/{project_id}/results 폴더에 저장
    save_result_to_json(all_results, results_dir);
    
    return 0;
}

