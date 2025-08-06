package usecase

import (
	"io"
	"io/fs"
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
