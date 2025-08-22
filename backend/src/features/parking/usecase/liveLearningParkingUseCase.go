package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	_interface "main/features/parking/model/interface"
	"main/features/parking/model/request"
	"main/features/parking/model/response"
)

type LiveLearningParkingUseCase struct {
	Repository     _interface.ILiveLearningParkingRepository
	ContextTimeout time.Duration
}

func NewLiveLearningParkingUseCase(repo _interface.ILiveLearningParkingRepository, timeout time.Duration) _interface.ILiveLearningParkingUseCase {
	return &LiveLearningParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *LiveLearningParkingUseCase) LiveLearning(c context.Context, req request.ReqLiveLearning) (response.ResLiveLearning, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 현재 작업 디렉토리 가져오기
	currentDir, err := os.Getwd()
	if err != nil {
		return response.ResLiveLearning{
			Cctvs:      []string{},
			TotalCctvs: 0,
		}, err
	}

	// Go 백엔드가 backend/src에서 실행되므로 상위 디렉토리로 이동
	backendDir := filepath.Join(currentDir, "..")
	opencvPath := filepath.Join(backendDir, "opencv", "build", "main")

	// 폴더명/파일명을 전체 경로로 변환
	fullPaths := liveBuildFullPaths(req)
	fmt.Println("변환된 전체 경로:", fullPaths)

	if err := validatePaths(opencvPath); err != nil {
		return response.ResLiveLearning{
			Cctvs:      []string{},
			TotalCctvs: 0,
		}, err
	}

	if err := validatePaths(fullPaths.LearningPath); err != nil {
		return response.ResLiveLearning{
			Cctvs:      []string{},
			TotalCctvs: 0,
		}, err
	}
	if err := validatePaths(fullPaths.RoiPath); err != nil {
		return response.ResLiveLearning{
			Cctvs:      []string{},
			TotalCctvs: 0,
		}, err
	}

	// OpenCV 실행
	success, message, _, cctvIds := d.executeOpenCV(c, fullPaths, backendDir)
	fmt.Println(success, message)

	// CCTV ID 배열을 []string으로 변환
	var cctvList []string
	if cctvIds != nil {
		if ids, ok := cctvIds.([]string); ok {
			cctvList = ids
		}
	}

	return response.ResLiveLearning{
		Cctvs:      cctvList,
		TotalCctvs: len(cctvList),
	}, nil
}

// OpenCV 실행
func (d *LiveLearningParkingUseCase) executeOpenCV(ctx context.Context, req request.ReqLiveLearning, backendDir string) (bool, string, string, interface{}) {
	opencvPath := filepath.Join(backendDir, "opencv", "build", "main")

	// OpenCV 실행 명령어 구성 (새로운 파라미터 순서)
	args := []string{
		fmt.Sprintf("%f", req.LearningRate),              // learning_rate
		fmt.Sprintf("%d", req.Iterations),                // iterations
		fmt.Sprintf("%f", req.VarThreshold),              // var_threshold
		req.ProjectID,                                    // project_id
		req.LearningPath,                                 // learning_base_path
		"../../shared/banpo/currentImages",               // test_images_path (폴더)
		req.RoiPath,                                      // roi_path
		"../../shared/" + req.ProjectID + "/liveResults", // results_dir
	}

	// 명령어 실행
	cmd := exec.Command(opencvPath, args...)
	cmd.Dir = filepath.Join(backendDir, "opencv") // OpenCV 디렉토리를 작업 디렉토리로 설정

	// 실행 결과 캡처
	output, err := cmd.CombinedOutput()
	if err != nil {
		return false, fmt.Sprintf("OpenCV 실행 실패: %v\n출력: %s", err, string(output)), "", nil
	}

	// 결과 폴더에서 CCTV 폴더들 읽기
	resultDir := filepath.Join("../../shared", req.ProjectID, "liveResults")
	cctvFolders, err := d.getCctvFoldersFromResults(resultDir)
	if err != nil {
		return false, fmt.Sprintf("CCTV 폴더 읽기 실패: %v", err), "", nil
	}

	// JSON 문자열을 CCTV ID 배열로 변환
	var cctvList []map[string]interface{}
	if err := json.Unmarshal([]byte(cctvFolders), &cctvList); err != nil {
		return false, fmt.Sprintf("CCTV 데이터 파싱 실패: %v", err), "", nil
	}

	// CCTV ID만 추출
	var cctvIds []string
	for _, cctv := range cctvList {
		if cctvId, ok := cctv["cctv_id"].(string); ok {
			cctvIds = append(cctvIds, cctvId)
		}
	}

	return true, string(output), resultDir, cctvIds
}

// 결과 폴더에서 CCTV 폴더들을 읽어서 JSON 문자열로 반환
func (d *LiveLearningParkingUseCase) getCctvFoldersFromResults(resultDir string) (string, error) {
	// 결과 디렉토리 확인
	if _, err := os.Stat(resultDir); os.IsNotExist(err) {
		return "[]", nil // 디렉토리가 없으면 빈 배열 반환
	}

	// 디렉토리 내용 읽기
	entries, err := os.ReadDir(resultDir)
	if err != nil {
		return "", fmt.Errorf("결과 디렉토리 읽기 실패: %v", err)
	}

	var cctvList []map[string]interface{}

	for _, entry := range entries {
		if entry.IsDir() {
			cctvId := entry.Name()

			// CCTV 폴더 내부에 이미지 파일이 있는지 확인
			cctvPath := filepath.Join(resultDir, cctvId)
			hasImages := d.checkCctvHasImages(cctvPath)

			cctvInfo := map[string]interface{}{
				"cctv_id":    cctvId,
				"has_images": hasImages,
			}

			cctvList = append(cctvList, cctvInfo)
		}
	}

	// JSON으로 직렬화
	jsonData, err := json.Marshal(cctvList)
	if err != nil {
		return "", fmt.Errorf("JSON 직렬화 실패: %v", err)
	}

	return string(jsonData), nil
}

// CCTV 폴더에 이미지 파일이 있는지 확인
func (d *LiveLearningParkingUseCase) checkCctvHasImages(cctvPath string) bool {
	entries, err := os.ReadDir(cctvPath)
	if err != nil {
		return false
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			// 파일 확장자 확인 (이미지 파일)
			ext := strings.ToLower(filepath.Ext(entry.Name()))
			if ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".bmp" {
				return true
			}
		}
	}

	return false
}
