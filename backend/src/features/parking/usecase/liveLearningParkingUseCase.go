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

	"main/features/parking/model/entity"
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
			FolderPath: "",
		}, nil
	}

	// Go 백엔드가 backend/src에서 실행되므로 상위 디렉토리로 이동
	backendDir := filepath.Join(currentDir, "..")
	opencvPath := filepath.Join(backendDir, "opencv", "build", "main")

	if err := validatePaths(opencvPath); err != nil {
		return response.ResLiveLearning{
			FolderPath: "",
		}, nil
	}

	if err := validatePaths(req.LearningPath); err != nil {
		return response.ResLiveLearning{
			FolderPath: "",
		}, nil
	}
	if err := validatePaths(req.RoiPath); err != nil {
		return response.ResLiveLearning{
			FolderPath: "",
		}, nil
	}

	// OpenCV 실행
	success, message, resultPath := d.executeOpenCV(c, req, backendDir)
	fmt.Println(success, message)
	return response.ResLiveLearning{
		FolderPath: resultPath,
	}, nil
}

// OpenCV 실행
func (d *LiveLearningParkingUseCase) executeOpenCV(ctx context.Context, req request.ReqLiveLearning, backendDir string) (bool, string, string) {
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
		if p == "liveResults" && i+1 < len(parts) {
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

	// 폴더명만 반환 (전체 경로가 아닌)
	return true, fmt.Sprintf("학습이 성공적으로 완료되었습니다.\n생성된 JSON 파일: %v", result), folderName
}
