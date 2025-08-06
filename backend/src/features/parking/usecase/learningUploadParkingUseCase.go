package usecase

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"main/common"
	_interface "main/features/parking/model/interface"
	"main/features/parking/model/response"
)

type LearningUploadParkingUseCase struct {
	Repository     _interface.ILearningUploadParkingRepository
	ContextTimeout time.Duration
}

func NewLearningUploadParkingUseCase(repo _interface.ILearningUploadParkingRepository, timeout time.Duration) _interface.ILearningUploadParkingUseCase {
	return &LearningUploadParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *LearningUploadParkingUseCase) LearningUpload(c context.Context, projectID string, files []*multipart.FileHeader) (response.ResLearningUpload, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)
	targetPath := filepath.Join(projectPath, "uploads", "learningImages")

	// 폴더 생성
	if err := os.MkdirAll(targetPath, 0755); err != nil {
		return response.ResLearningUpload{}, err
	}

	// 루트 폴더명 생성 (타임스탬프)
	rootFolderName := fmt.Sprintf("folder_%d", time.Now().Unix())

	// 루트 폴더 경로 생성
	rootFolderPath := filepath.Join(targetPath, rootFolderName)
	if err := os.MkdirAll(rootFolderPath, 0755); err != nil {
		return response.ResLearningUpload{}, err
	}

	savedCount := 0
	var savedFiles []string
	folderStructure := make(map[string][]string)
	var errors []string

	for _, file := range files {
		// Content-Disposition 헤더에서 전체 경로 추출
		contentDisposition := file.Header.Get("Content-Disposition")
		var relativePath string

		if contentDisposition != "" {
			// "filename=" 부분을 찾아서 경로 추출
			if filenameStart := strings.Index(contentDisposition, "filename=\""); filenameStart != -1 {
				filenameStart += 10 // "filename=" 길이
				if filenameEnd := strings.Index(contentDisposition[filenameStart:], "\""); filenameEnd != -1 {
					relativePath = contentDisposition[filenameStart : filenameStart+filenameEnd]
				}
			}
		}

		// 경로 정보가 없으면 파일명만 사용
		if relativePath == "" {
			relativePath = file.Filename
		}

		// 폴더 구조 유지하여 저장
		fileDir := filepath.Dir(relativePath)
		if fileDir != "." {
			// 하위 폴더가 있는 경우 생성
			subDir := filepath.Join(rootFolderPath, fileDir)
			if err := os.MkdirAll(subDir, 0755); err != nil {
				errorMsg := fmt.Sprintf("하위 폴더 생성 실패: %s - %v", subDir, err)
				errors = append(errors, errorMsg)
				continue
			}
		}

		// 최종 저장 경로 (폴더 구조 그대로 유지)
		finalPath := filepath.Join(rootFolderPath, relativePath)

		// 파일 저장
		if err := saveUploadedFile(file, finalPath); err != nil {
			errorMsg := fmt.Sprintf("파일 저장 실패: %s - %v", filepath.Base(file.Filename), err)
			errors = append(errors, errorMsg)
			continue
		}

		savedCount++
		savedFiles = append(savedFiles, finalPath)

		// 폴더 구조 정보 저장
		dir := filepath.Dir(relativePath)
		if dir == "." {
			dir = "root"
		}
		folderStructure[dir] = append(folderStructure[dir], filepath.Base(file.Filename))
	}
	return response.ResLearningUpload{
		TotalFiles: len(files),
		Success:    savedCount,
		Failed:     len(errors),
	}, nil
}
