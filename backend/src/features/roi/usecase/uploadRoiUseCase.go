package usecase

import (
	"context"
	"fmt"
	"main/common"
	_interface "main/features/roi/model/interface"
	"main/features/roi/model/response"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"
)

type UploadRoiUseCase struct {
	Repository     _interface.IUploadRoiRepository
	ContextTimeout time.Duration
}

func NewUploadRoiUseCase(repo _interface.IUploadRoiRepository, timeout time.Duration) _interface.IUploadRoiUseCase {
	return &UploadRoiUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *UploadRoiUseCase) UploadRoi(c context.Context, projectID string, files []*multipart.FileHeader) (response.ResUpload, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)
	targetPath := filepath.Join(projectPath, "uploads", "testImages")

	// 폴더 생성
	if err := os.MkdirAll(targetPath, 0755); err != nil {
		return response.ResUpload{}, err
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

	return response.ResUpload{
		TotalFiles: len(files),
		Success:    savedCount,
		Failed:     len(errors),
	}, nil
}
