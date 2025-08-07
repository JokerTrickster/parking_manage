package usecase

import (
	"context"
	"main/common"
	_interface "main/features/parking/model/interface"
	"main/features/parking/model/response"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type RoiStatsParkingUseCase struct {
	Repository     _interface.IRoiStatsParkingRepository
	ContextTimeout time.Duration
}

func NewRoiStatsParkingUseCase(repo _interface.IRoiStatsParkingRepository, timeout time.Duration) _interface.IRoiStatsParkingUseCase {
	return &RoiStatsParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *RoiStatsParkingUseCase) GetRoiStats(c context.Context, projectID string) (response.ResRoiStats, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)
	targetPath := filepath.Join(projectPath, "uploads", "roi")

	// 디렉토리가 존재하는지 확인
	if _, err := os.Stat(targetPath); os.IsNotExist(err) {
		// 디렉토리가 없으면 빈 결과 반환
		return response.ResRoiStats{
			Folders: []response.FolderInfo{},
			Total:   0,
		}, nil
	}

	// 디렉토리 읽기
	entries, err := os.ReadDir(targetPath)
	if err != nil {
		return response.ResRoiStats{}, err
	}

	var folders []response.FolderInfo
	totalFiles := 0

	// ROI 파일들은 개별 파일이므로, 각 파일을 하나의 폴더로 취급
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(strings.ToLower(entry.Name()), ".json") {
			// JSON 파일만 처리
			filePath := filepath.Join(targetPath, entry.Name())

			// 파일 정보를 FolderInfo로 변환
			folderInfo := response.FolderInfo{
				Name:      entry.Name(),
				Path:      filePath,
				FileCount: 1, // 각 파일은 1개로 계산
			}

			folders = append(folders, folderInfo)
			totalFiles++
		}
	}

	return response.ResRoiStats{
		Folders: folders,
		Total:   totalFiles,
	}, nil
}
