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

type CctvImageParkingUseCase struct {
	Repository     _interface.ICctvImageParkingRepository
	ContextTimeout time.Duration
}

func NewCctvImageParkingUseCase(repo _interface.ICctvImageParkingRepository, timeout time.Duration) _interface.ICctvImageParkingUseCase {
	return &CctvImageParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *CctvImageParkingUseCase) GetCctvImage(ctx context.Context, projectID string, cctvID string, imageType string) (response.ResCctvImage, error) {
	_, cancel := context.WithTimeout(ctx, d.ContextTimeout)
	defer cancel()

	// 현재 작업 디렉토리 확인
	currentDir, err := os.Getwd()
	if err != nil {
		return response.ResCctvImage{
			Success: false,
			Message: "Failed to get current directory: " + err.Error(),
		}, nil
	}

	// CCTV 폴더 경로 구성 (절대 경로 사용)
	cctvPath := filepath.Join(currentDir, "..", "..", "shared", projectID, "liveResults", cctvID)

	// 디버깅을 위한 로그 출력
	fmt.Printf("Current directory: %s\n", currentDir)
	fmt.Printf("CCTV path: %s\n", cctvPath)

	// 폴더가 존재하는지 확인
	if _, err := os.Stat(cctvPath); os.IsNotExist(err) {
		return response.ResCctvImage{
			Success: false,
			Message: "CCTV results not found",
		}, err
	}

	if imageType == "roi_result" {
		roiImagePath := filepath.Join(cctvPath, "roi_result.jpg")
		roiImageData, err := os.ReadFile(roiImagePath)
		if err != nil {
			return response.ResCctvImage{
				Success: false,
				Message: "Failed to read ROI image: " + err.Error(),
			}, nil
		}
		return response.ResCctvImage{
			Success:     true,
			Message:     "CCTV images retrieved successfully",
			CctvID:      cctvID,
			Image:       roiImageData,
			ContentType: "image/jpeg",
		}, nil
	} else if imageType == "fgmask" {
		fgMaskImagePath := filepath.Join(cctvPath, "fgmask.jpg")
		fgMaskImageData, err := os.ReadFile(fgMaskImagePath)
		if err != nil {
			return response.ResCctvImage{
				Success: false,
				Message: "Failed to read FG mask image: " + err.Error(),
			}, nil
		}
		return response.ResCctvImage{
			Success:     true,
			Message:     "CCTV images retrieved successfully",
			CctvID:      cctvID,
			Image:       fgMaskImageData,
			ContentType: "image/jpeg",
		}, nil
	} else {
		return response.ResCctvImage{
			Success: false,
			Message: "Invalid image type",
		}, nil
	}
}
