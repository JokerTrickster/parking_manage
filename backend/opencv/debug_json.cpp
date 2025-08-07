#include <iostream>
#include <fstream>
#include <nlohmann/json.hpp>
#include <vector>
#include <opencv2/opencv.hpp>

using namespace std;
using namespace cv;
using json = nlohmann::json;

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
                if (match.contains("img_center_roi")) {
                    roi_arr = match["img_center_roi"];
                    cout << "img_center_roi 필드 발견" << endl;
                } else if (match.contains("original_roi")) {
                    roi_arr = match["original_roi"];
                    cout << "original_roi 필드 발견" << endl;
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
                    cout << "포인트 추가: (" << x << ", " << y << ")" << endl;
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

int main() {
    string json_path = "../../shared/banpo/uploads/roi/matched_rois_and_parkings_250718.json";
    string cctv_id = "P1_B3_1_4";
    
    cout << "=== JSON 디버깅 시작 ===" << endl;
    cout << "JSON 파일: " << json_path << endl;
    cout << "CCTV ID: " << cctv_id << endl;
    
    vector<vector<Point>> rois = get_rois_from_json(json_path, cctv_id);
    
    cout << "=== 결과 ===" << endl;
    cout << "총 ROI 개수: " << rois.size() << endl;
    
    for (size_t i = 0; i < rois.size(); i++) {
        cout << "ROI " << i << ": ";
        for (const auto& point : rois[i]) {
            cout << "(" << point.x << ", " << point.y << ") ";
        }
        cout << endl;
    }
    
    return 0;
}
