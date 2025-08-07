package usecase

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"

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
			Success: false,
			Message: "현재 디렉토리 조회 실패: " + err.Error(),
		}, nil
	}

	// Go 백엔드가 backend/src에서 실행되므로 상위 디렉토리로 이동
	backendDir := filepath.Join(currentDir, "..")
	opencvPath := filepath.Join(backendDir, "opencv", "build", "main")

	// 디버깅을 위한 로그 출력
	fmt.Printf("현재 디렉토리: %s\n", currentDir)
	fmt.Printf("Backend 디렉토리: %s\n", backendDir)
	fmt.Printf("OpenCV 경로: %s\n", opencvPath)

	if _, err := os.Stat(opencvPath); os.IsNotExist(err) {
		return response.ResLearning{
			Success: false,
			Message: "OpenCV 실행 파일을 찾을 수 없습니다: " + opencvPath,
		}, nil
	}

	// 입력 파일 경로들 확인
	if err := validatePaths(req); err != nil {
		return response.ResLearning{
			Success: false,
			Message: "입력 파일 경로 검증에 실패했습니다: " + err.Error(),
		}, nil
	}

	// OpenCV 실행
	success, message := d.executeOpenCV(req, backendDir)

	return response.ResLearning{
		Success: success,
		Message: message,
	}, nil
}

// 입력 파일 경로 검증
func validatePaths(req request.ReqLearning) error {
	// 학습 이미지 경로 확인
	if _, err := os.Stat(req.LearningPath); os.IsNotExist(err) {
		return fmt.Errorf("학습 이미지 경로가 존재하지 않습니다: %s", req.LearningPath)
	}

	// 테스트 이미지 경로 확인
	if _, err := os.Stat(req.TestPath); os.IsNotExist(err) {
		return fmt.Errorf("테스트 이미지 경로가 존재하지 않습니다: %s", req.TestPath)
	}

	// ROI 파일 경로 확인
	if _, err := os.Stat(req.RoiPath); os.IsNotExist(err) {
		return fmt.Errorf("ROI 파일 경로가 존재하지 않습니다: %s", req.RoiPath)
	}

	return nil
}

// OpenCV 실행
func (d *LearningParkingUseCase) executeOpenCV(req request.ReqLearning, backendDir string) (bool, string) {
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
	}

	// 명령어 실행
	cmd := exec.Command(opencvPath, args...)
	cmd.Dir = filepath.Join(backendDir, "opencv") // OpenCV 디렉토리를 작업 디렉토리로 설정

	// 실행 결과 캡처
	output, err := cmd.CombinedOutput()
	if err != nil {
		return false, fmt.Sprintf("OpenCV 실행 실패: %v\n출력: %s", err, string(output))
	}

	// 성공 시 결과 메시지 반환
	return true, fmt.Sprintf("학습이 성공적으로 완료되었습니다.\n출력: %s", string(output))
}
