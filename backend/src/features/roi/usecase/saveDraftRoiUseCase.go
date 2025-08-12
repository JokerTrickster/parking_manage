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

type SaveDraftRoiUseCase struct {
	Repository     _interface.ISaveDraftRoiRepository
	ContextTimeout time.Duration
}

func NewSaveDraftRoiUseCase(repo _interface.ISaveDraftRoiRepository, timeout time.Duration) _interface.ISaveDraftRoiUseCase {
	return &SaveDraftRoiUseCase{Repository: repo, ContextTimeout: timeout}
}

// SaveDraftRoi 초안 JSON 파일을 현재 날짜를 붙여서 roi 폴더에 저장
func (d *SaveDraftRoiUseCase) SaveDraftRoi(c context.Context, projectID string, roiFileName string) (response.ResSaveDraft, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)

	// draft 파일 경로
	roiFolderPath := filepath.Join(projectPath, "uploads", "roi")
	roiFileName += "_draft.json"
	draftFilePath := filepath.Join(roiFolderPath, "draft", roiFileName)

	// draft 파일 존재 확인
	if _, err := os.Stat(draftFilePath); os.IsNotExist(err) {
		return response.ResSaveDraft{}, fmt.Errorf("draft 파일을 찾을 수 없습니다: %s", roiFileName)
	}

	// 현재 날짜로 파일명 생성
	now := time.Now()
	dateStr := now.Format("20060102_150405")
	ext := filepath.Ext(roiFileName)
	nameWithoutExt := roiFileName[:len(roiFileName)-len(ext)]

	// _draft 제거
	if len(nameWithoutExt) > 6 && nameWithoutExt[len(nameWithoutExt)-6:] == "_draft" {
		nameWithoutExt = nameWithoutExt[:len(nameWithoutExt)-6]
	}

	savedFileName := fmt.Sprintf("%s_%s%s", nameWithoutExt, dateStr, ext)
	savedFilePath := filepath.Join(roiFolderPath, savedFileName)

	// 파일 복사
	if err := copyFile(draftFilePath, savedFilePath); err != nil {
		return response.ResSaveDraft{}, fmt.Errorf("파일 저장 실패: %v", err)
	}

	return response.ResSaveDraft{
		Success:  true,
		Message:  "초안이 성공적으로 저장되었습니다",
		FileName: savedFileName,
	}, nil
}
