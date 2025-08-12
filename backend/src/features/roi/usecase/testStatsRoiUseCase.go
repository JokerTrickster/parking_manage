package usecase

import (
	"context"
	"fmt"
	"main/common"
	_interface "main/features/roi/model/interface"
	"main/features/roi/model/response"
	"os"
	"path/filepath"
	"time"
)

type TestStatsRoiUseCase struct {
	Repository     _interface.ITestStatsRoiRepository
	ContextTimeout time.Duration
}

func NewTestStatsRoiUseCase(repo _interface.ITestStatsRoiRepository, timeout time.Duration) _interface.ITestStatsRoiUseCase {
	return &TestStatsRoiUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *TestStatsRoiUseCase) GetTestStats(c context.Context, projectID string, folderPath string) (response.ResTestStatsRoi, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)
	targetPath := filepath.Join(projectPath, "uploads", "testImages", folderPath)
	fmt.Println(targetPath)

	var images []response.ImageInfo
	total := 0

	// 디렉토리가 존재하는지 확인
	if _, err := os.Stat(targetPath); os.IsNotExist(err) {
		// 디렉토리가 없으면 빈 결과 반환
		return response.ResTestStatsRoi{
			Images: images,
			Total:  total,
		}, nil
	}

	// 디렉토리 읽기
	entries, err := os.ReadDir(targetPath)
	if err != nil {
		return response.ResTestStatsRoi{}, err
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			// 이미지 파일 확장자 확인
			fileName := entry.Name()
			ext := filepath.Ext(fileName)
			if ext == ".jpg" || ext == ".jpeg" || ext == ".png" {
				imagePath := filepath.Join(targetPath, fileName)
				images = append(images, response.ImageInfo{
					Name: fileName,
					Path: imagePath,
				})
				total++
			}
		}
	}

	return response.ResTestStatsRoi{
		Images: images,
		Total:  total,
	}, nil
}
