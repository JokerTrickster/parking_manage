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

type CctvImagesParkingUseCase struct {
	Repository     _interface.ICctvImagesParkingRepository
	ContextTimeout time.Duration
}

func NewCctvImagesParkingUseCase(repo _interface.ICctvImagesParkingRepository, timeout time.Duration) _interface.ICctvImagesParkingUseCase {
	return &CctvImagesParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *CctvImagesParkingUseCase) GetCctvImages(ctx context.Context, projectID string, timestamp string, cctvID string) (response.ResCctvImages, error) {
	_, cancel := context.WithTimeout(ctx, d.ContextTimeout)
	defer cancel()

	// 현재 작업 디렉토리 확인
	currentDir, err := os.Getwd()
	if err != nil {
		return response.ResCctvImages{
			Success: false,
			Message: "Failed to get current directory: " + err.Error(),
		}, nil
	}

	// CCTV 폴더 경로 구성 (절대 경로 사용)
	cctvPath := filepath.Join(currentDir, "..", "..", "shared", projectID, "results", timestamp, cctvID)

	// 디버깅을 위한 로그 출력
	fmt.Printf("Current directory: %s\n", currentDir)
	fmt.Printf("CCTV path: %s\n", cctvPath)

	// 폴더가 존재하는지 확인
	if _, err := os.Stat(cctvPath); os.IsNotExist(err) {
		return response.ResCctvImages{
			Success: false,
			Message: "CCTV results not found",
		}, nil
	}

	// 이미지 파일 경로 확인
	roiImagePath := filepath.Join(cctvPath, "roi_result.jpg")
	fgMaskImagePath := filepath.Join(cctvPath, "fgmask.jpg")

	// 이미지 파일 존재 여부 확인
	if _, err := os.Stat(roiImagePath); os.IsNotExist(err) {
		return response.ResCctvImages{
			Success: false,
			Message: "ROI result image not found",
		}, nil
	}

	if _, err := os.Stat(fgMaskImagePath); os.IsNotExist(err) {
		return response.ResCctvImages{
			Success: false,
			Message: "Foreground mask image not found",
		}, nil
	}

	// 이미지 URL 구성 (정적 파일 서빙을 통해 접근)
	roiImageURL := fmt.Sprintf("/results/%s/results/%s/%s/roi_result.jpg", projectID, timestamp, cctvID)
	fgMaskImageURL := fmt.Sprintf("/results/%s/results/%s/%s/fgmask.jpg", projectID, timestamp, cctvID)

	return response.ResCctvImages{
		Success: true,
		Message: "CCTV images retrieved successfully",
		Data: response.CctvImagesData{
			CctvID:         cctvID,
			RoiResultImage: roiImageURL,
			FgMaskImage:    fgMaskImageURL,
		},
	}, nil
}
