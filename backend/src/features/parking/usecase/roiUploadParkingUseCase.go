package usecase

import (
	"context"
	"fmt"
	"main/common"
	_interface "main/features/parking/model/interface"
	"main/features/parking/model/response"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"
)

type RoiUploadParkingUseCase struct {
	Repository     _interface.IRoiUploadParkingRepository
	ContextTimeout time.Duration
}

func NewRoiUploadParkingUseCase(repo _interface.IRoiUploadParkingRepository, timeout time.Duration) _interface.IRoiUploadParkingUseCase {
	return &RoiUploadParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *RoiUploadParkingUseCase) RoiUpload(c context.Context, projectID string, files []*multipart.FileHeader) (response.ResRoiUpload, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)
	targetPath := filepath.Join(projectPath, "uploads", "roi")

	// 폴더 생성
	if err := os.MkdirAll(targetPath, 0755); err != nil {
		return response.ResRoiUpload{}, err
	}

	savedCount := 0
	var errors []string

	for _, file := range files {
		// 파일명 그대로 사용 (원본 파일명 유지)
		fileName := file.Filename

		// 최종 저장 경로 (파일명 그대로)
		finalPath := filepath.Join(targetPath, fileName)

		// 파일 저장
		if err := saveUploadedFile(file, finalPath); err != nil {
			errorMsg := fmt.Sprintf("파일 저장 실패: %s - %v", fileName, err)
			errors = append(errors, errorMsg)
			continue
		}

		savedCount++
	}

	return response.ResRoiUpload{
		TotalFiles: len(files),
		Success:    savedCount,
		Failed:     len(errors),
	}, nil
}
