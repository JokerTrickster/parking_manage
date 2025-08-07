package usecase

import (
	"fmt"
	"io"
	"io/fs"
	"main/features/parking/model/request"
	"mime/multipart"
	"os"
	"path/filepath"
)

// saveUploadedFile 파일 저장 헬퍼 함수
func saveUploadedFile(file *multipart.FileHeader, filePath string) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = io.Copy(dst, src)
	return err
}

// 디렉토리 내 파일 수를 세는 헬퍼 함수
func countFilesInDirectory(dirPath string) (int, error) {
	count := 0
	err := filepath.WalkDir(dirPath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() {
			count++
		}
		return nil
	})
	return count, err
}

// 입력 파일 경로 검증
func validatePaths(req request.ReqLearning) error {
	// 학습 이미지 경로 확인
	if _, err := os.Stat(req.LearningPath); os.IsNotExist(err) {
		return fmt.Errorf("학습 이미지 경로가 존재하지 않습니다: %s", req.LearningPath)
	}

	// 테스트 이미지 경로 확인
	if _, err := os.Stat(req.TestPath); os.IsNotExist(err) {
		return fmt.Errorf("테스트 이미지 경로가 존재하지 않습니다: %s", req.TestPath)
	}

	// ROI 파일 경로 확인
	if _, err := os.Stat(req.RoiPath); os.IsNotExist(err) {
		return fmt.Errorf("ROI 파일 경로가 존재하지 않습니다: %s", req.RoiPath)
	}

	return nil
}
