package usecase

import (
	"context"
	"fmt"
	"io/ioutil"
	"main/common"
	_interface "main/features/roi/model/interface"
	"main/features/roi/model/response"
	"mime"
	"os"
	"path/filepath"
	"time"
)

type GetImageRoiUseCase struct {
	Repository     _interface.IGetImageRoiRepository
	ContextTimeout time.Duration
}

func NewGetImageRoiUseCase(repo _interface.IGetImageRoiRepository, timeout time.Duration) _interface.IGetImageRoiUseCase {
	return &GetImageRoiUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *GetImageRoiUseCase) GetImageRoi(c context.Context, projectID string, folderPath string, fileName string) (response.ResGetImageRoi, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)
	targetPath := filepath.Join(projectPath, "uploads", "testImages", folderPath)
	imagePath := filepath.Join(targetPath, fileName)

	// 이미지 파일이 존재하는지 확인
	if _, err := os.Stat(imagePath); os.IsNotExist(err) {
		return response.ResGetImageRoi{
			Success: false,
			Message: fmt.Sprintf("이미지 파일을 찾을 수 없습니다: %s", fileName),
		}, nil
	}

	// 이미지 파일 확장자 확인
	ext := filepath.Ext(fileName)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		return response.ResGetImageRoi{
			Success: false,
			Message: "지원하지 않는 이미지 형식입니다",
		}, nil
	}

	// 이미지 파일 읽기
	imageData, err := ioutil.ReadFile(imagePath)
	if err != nil {
		return response.ResGetImageRoi{
			Success: false,
			Message: fmt.Sprintf("이미지 파일 읽기 실패: %v", err),
		}, nil
	}

	// Content-Type 설정
	contentType := mime.TypeByExtension(ext)
	if contentType == "" {
		switch ext {
		case ".jpg", ".jpeg":
			contentType = "image/jpeg"
		case ".png":
			contentType = "image/png"
		default:
			contentType = "application/octet-stream"
		}
	}

	return response.ResGetImageRoi{
		Data:        imageData,
		ContentType: contentType,
		Success:     true,
		Message:     "이미지를 성공적으로 가져왔습니다",
	}, nil
}
