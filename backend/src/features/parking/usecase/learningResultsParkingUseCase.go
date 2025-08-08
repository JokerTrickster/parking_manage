package usecase

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_interface "main/features/parking/model/interface"
	"main/features/parking/model/response"
)

type LearningResultsParkingUseCase struct {
	Repository     _interface.ILearningResultsParkingRepository
	ContextTimeout time.Duration
}

func NewLearningResultsParkingUseCase(repo _interface.ILearningResultsParkingRepository, timeout time.Duration) _interface.ILearningResultsParkingUseCase {
	return &LearningResultsParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *LearningResultsParkingUseCase) GetLearningResults(ctx context.Context, projectID string, timestamp string) (response.ResLearningResults, error) {
	_, cancel := context.WithTimeout(ctx, d.ContextTimeout)
	defer cancel()

	// 현재 작업 디렉토리 확인
	currentDir, err := os.Getwd()
	if err != nil {
		return response.ResLearningResults{
			Success: false,
			Message: "Failed to get current directory: " + err.Error(),
		}, nil
	}

	// 결과 폴더 경로 구성 (절대 경로 사용)
	resultsPath := filepath.Join(currentDir, "..", "..", "shared", projectID, "results", timestamp)

	// 디버깅을 위한 로그 출력
	fmt.Printf("Current directory: %s\n", currentDir)
	fmt.Printf("Results path: %s\n", resultsPath)

	// 폴더가 존재하는지 확인
	if _, err := os.Stat(resultsPath); os.IsNotExist(err) {
		return response.ResLearningResults{
			Success: false,
			Message: "Learning results not found for the specified timestamp",
		}, nil
	}

	// CCTV 폴더 목록 조회
	cctvList := []response.CctvResultInfo{}

	entries, err := os.ReadDir(resultsPath)
	if err != nil {
		return response.ResLearningResults{
			Success: false,
			Message: "Failed to read results directory: " + err.Error(),
		}, nil
	}

	for _, entry := range entries {
		if entry.IsDir() {
			cctvID := entry.Name()
			cctvPath := filepath.Join(resultsPath, cctvID)

			// 이미지 파일 존재 여부 확인
			roiImagePath := filepath.Join(cctvPath, "roi_result.jpg")
			fgMaskImagePath := filepath.Join(cctvPath, "fgmask.jpg")

			hasImages := false
			if _, err := os.Stat(roiImagePath); err == nil {
				if _, err := os.Stat(fgMaskImagePath); err == nil {
					hasImages = true
				}
			}

			cctvList = append(cctvList, response.CctvResultInfo{
				CctvID:    cctvID,
				HasImages: hasImages,
			})
		}
	}

	return response.ResLearningResults{
		Success: true,
		Message: "Learning results retrieved successfully",
		Data: response.LearningResultsData{
			Timestamp: timestamp,
			CctvList:  cctvList,
		},
	}, nil
}
