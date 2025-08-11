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

type ImageParkingUseCase struct {
	Repository     _interface.IImageParkingRepository
	ContextTimeout time.Duration
}

func NewImageParkingUseCase(repo _interface.IImageParkingRepository, timeout time.Duration) _interface.IImageParkingUseCase {
	return &ImageParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *ImageParkingUseCase) GetImage(ctx context.Context, projectID string, folderPath string, cctvID string, imageType string) (response.ResImage, error) {
	_, cancel := context.WithTimeout(ctx, d.ContextTimeout)
	defer cancel()

	// 현재 작업 디렉토리 확인
	currentDir, err := os.Getwd()
	if err != nil {
		return response.ResImage{
			Success: false,
			Message: "Failed to get current directory: " + err.Error(),
		}, nil
	}

	// 이미지 파일 경로 구성
	var imagePath string
	switch imageType {
	case "roi_result":
		imagePath = filepath.Join(currentDir, "..", "..", "shared", projectID, "results", folderPath, cctvID, "roi_result.jpg")
	case "fgmask":
		imagePath = filepath.Join(currentDir, "..", "..", "shared", projectID, "results", folderPath, cctvID, "fgmask.jpg")
	default:
		return response.ResImage{
			Success: false,
			Message: "Invalid image type. Supported types: roi_result, fgmask",
		}, nil
	}

	// 절대 경로로 변환
	absPath, err := filepath.Abs(imagePath)
	if err != nil {
		return response.ResImage{
			Success: false,
			Message: "Failed to get absolute path: " + err.Error(),
		}, nil
	}
	imagePath = absPath

	// 디버깅을 위한 로그 출력
	fmt.Printf("Current directory: %s\n", currentDir)
	fmt.Printf("Image path: %s\n", imagePath)

	// 파일이 존재하는지 확인
	if _, err := os.Stat(imagePath); os.IsNotExist(err) {
		return response.ResImage{
			Success: false,
			Message: fmt.Sprintf("Image file not found: %s", imagePath),
		}, nil
	}

	// 파일 읽기
	imageData, err := os.ReadFile(imagePath)
	if err != nil {
		return response.ResImage{
			Success: false,
			Message: "Failed to read image file: " + err.Error(),
		}, nil
	}

	// Content-Type 결정
	contentType := "image/jpeg"
	if filepath.Ext(imagePath) == ".png" {
		contentType = "image/png"
	}

	return response.ResImage{
		Success:     true,
		Message:     "Image retrieved successfully",
		Data:        imageData,
		ContentType: contentType,
	}, nil
}
