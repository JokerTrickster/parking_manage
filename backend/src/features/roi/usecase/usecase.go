package usecase

import (
	"io"
	"mime/multipart"
	"os"
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
