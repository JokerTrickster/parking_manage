package usecase

import (
	"context"
	"main/common"
	_interface "main/features/parking/model/interface"
	"main/features/parking/model/response"
	"os"
	"path/filepath"
	"time"
)

type TestStatsParkingUseCase struct {
	Repository     _interface.ITestStatsParkingRepository
	ContextTimeout time.Duration
}

func NewTestStatsParkingUseCase(repo _interface.ITestStatsParkingRepository, timeout time.Duration) _interface.ITestStatsParkingUseCase {
	return &TestStatsParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *TestStatsParkingUseCase) GetTestStats(c context.Context, projectID string) (response.ResTestStats, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)
	targetPath := filepath.Join(projectPath, "uploads", "testImages")

	var folders []response.FolderInfo
	total := 0

	// 디렉토리가 존재하는지 확인
	if _, err := os.Stat(targetPath); os.IsNotExist(err) {
		// 디렉토리가 없으면 빈 결과 반환
		return response.ResTestStats{
			Folders: folders,
			Total:   total,
		}, nil
	}

	// 디렉토리 읽기
	entries, err := os.ReadDir(targetPath)
	if err != nil {
		return response.ResTestStats{}, err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			folderPath := filepath.Join(targetPath, entry.Name())
			fileCount, err := countFilesInDirectory(folderPath)
			if err != nil {
				continue // 개별 폴더 오류는 무시하고 계속 진행
			}

			folders = append(folders, response.FolderInfo{
				Name:      entry.Name(),
				Path:      folderPath,
				FileCount: fileCount,
			})
			total++
		}
	}

	return response.ResTestStats{
		Folders: folders,
		Total:   total,
	}, nil
}
