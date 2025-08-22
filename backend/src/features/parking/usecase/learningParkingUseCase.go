package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"main/common/db/mysql"
	"main/features/parking/model/entity"
	_interface "main/features/parking/model/interface"
	"main/features/parking/model/request"
	"main/features/parking/model/response"
)

type LearningParkingUseCase struct {
	Repository     _interface.ILearningParkingRepository
	ContextTimeout time.Duration
}

func NewLearningParkingUseCase(repo _interface.ILearningParkingRepository, timeout time.Duration) _interface.ILearningParkingUseCase {
	return &LearningParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *LearningParkingUseCase) Learning(c context.Context, req request.ReqLearning) (response.ResLearning, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 현재 작업 디렉토리 가져오기
	currentDir, err := os.Getwd()
	if err != nil {
		return response.ResLearning{
			FolderPath: "",
		}, nil
	}

	// Go 백엔드가 backend/src에서 실행되므로 상위 디렉토리로 이동
	backendDir := filepath.Join(currentDir, "..")
	opencvPath := filepath.Join(backendDir, "opencv", "build", "main")
	fmt.Println("원본 요청:", req)

	// 폴더명/파일명을 전체 경로로 변환
	fullPaths := buildFullPaths(req)
	fmt.Println("변환된 전체 경로:", fullPaths)

	if err := validatePaths(opencvPath); err != nil {
		return response.ResLearning{
			FolderPath: "",
		}, err
	}

	if err := validatePaths(fullPaths.LearningPath); err != nil {
		return response.ResLearning{
			FolderPath: "",
		}, err
	}
	if err := validatePaths(fullPaths.TestPath); err != nil {
		return response.ResLearning{
			FolderPath: "",
		}, err
	}
	if err := validatePaths(fullPaths.RoiPath); err != nil {
		return response.ResLearning{
			FolderPath: "",
		}, err
	}

	// OpenCV 실행 (전체 경로로 변환된 요청 사용)
	success, message, resultPath := d.executeOpenCV(c, fullPaths, backendDir)
	fmt.Println(success, message)
	return response.ResLearning{
		FolderPath: resultPath,
	}, nil
}

// OpenCV 실행
func (d *LearningParkingUseCase) executeOpenCV(ctx context.Context, req request.ReqLearning, backendDir string) (bool, string, string) {
	opencvPath := filepath.Join(backendDir, "opencv", "build", "main")

	// OpenCV 실행 명령어 구성 (새로운 파라미터 순서)
	args := []string{
		fmt.Sprintf("%f", req.LearningRate), // learning_rate
		fmt.Sprintf("%d", req.Iterations),   // iterations
		fmt.Sprintf("%f", req.VarThreshold), // var_threshold
		req.ProjectID,                       // project_id
		req.LearningPath,                    // learning_base_path
		req.TestPath,                        // test_images_path (폴더)
		req.RoiPath,                         // roi_path
		"../../shared/" + req.ProjectID + "/results/" + getCurrentTimestamp(), // results_dir
	}

	// 명령어 실행
	cmd := exec.Command(opencvPath, args...)
	cmd.Dir = filepath.Join(backendDir, "opencv") // OpenCV 디렉토리를 작업 디렉토리로 설정

	// 실행 결과 캡처
	output, err := cmd.CombinedOutput()
	if err != nil {
		return false, fmt.Sprintf("OpenCV 실행 실패: %v\n출력: %s", err, string(output)), ""
	}

	outputStr := string(output)
	fmt.Println("OpenCV 출력:", outputStr)

	// JSON 파일명 추출
	lines := strings.Split(outputStr, "\n")
	var jsonFilename string
	for _, line := range lines {
		if strings.HasPrefix(line, "JSON_FILE:") {
			jsonFilename = strings.TrimSpace(strings.TrimPrefix(line, "JSON_FILE:"))
			break
		}
	}

	if jsonFilename == "" {
		return false, "JSON 파일명을 찾을 수 없습니다.", ""
	}
	// JSON 파일 경로에서 results/ 뒤 폴더명 추출
	parts := strings.Split(jsonFilename, string(os.PathSeparator))
	folderName := ""
	for i, p := range parts {
		if p == "results" && i+1 < len(parts) {
			folderName = parts[i+1]
			break
		}
	}

	if folderName == "" {
		return false, "폴더명을 추출할 수 없습니다.", ""
	}

	data, err := os.ReadFile(jsonFilename)
	if err != nil {
		return false, fmt.Sprintf("JSON 파일 읽기 실패: %v", err), ""
	}

	var result entity.ExperimentResult
	if err := json.Unmarshal(data, &result); err != nil {
		log.Fatal(err)
	}

	// DB 저장 로직
	// gorm 객체 생성 후 저장
	//ExperimentSession 객체 생성 후 저장
	experimentSessionDB := mysql.ExperimentSessions{
		VarThreshold:  req.VarThreshold,
		LearningRate:  req.LearningRate,
		Iterations:    req.Iterations,
		LearningPath:  req.LearningPath,
		TestImagePath: req.TestPath,
		RoiPath:       req.RoiPath,
		ProjectId:     req.ProjectID,
		Name:          folderName,
	}
	esID, err := d.Repository.CreateExperimentSession(ctx, experimentSessionDB)
	if err != nil {
		return false, fmt.Sprintf("실험 세션 생성 실패: %v", err), ""
	}
	// CctvResult 객체 생성 후 저장
	for _, cctvResult := range result.Results {
		cctvResultDB := mysql.CctvResults{
			ExperimentSessionId: esID,
			CctvId:              cctvResult.CctvID,
			LearningDataSize:    cctvResult.LearningDataSize,
		}
		crID, err := d.Repository.CreateCctvResult(ctx, cctvResultDB)
		if err != nil {
			return false, fmt.Sprintf("CctvResult 생성 실패: %v", err), ""
		}
		// RoiResult 객체 생성 후 저장
		for _, roiResult := range cctvResult.RoiResults {
			roiResultDB := mysql.RoiResults{
				CctvResultId: crID,
				RoiId:        roiResult.RoiID,
				Rate:         roiResult.ForegroundRatio,
			}
			err = d.Repository.CreateRoiResult(ctx, roiResultDB)
			if err != nil {
				return false, fmt.Sprintf("RoiResult 생성 실패: %v", err), ""
			}
		}
	}

	// 폴더명만 반환 (전체 경로가 아닌)
	return true, fmt.Sprintf("학습이 성공적으로 완료되었습니다.\n생성된 JSON 파일: %v", result), folderName
}
