package usecase

import (
	"context"
	"fmt"
	"main/common"
	_interface "main/features/roi/model/interface"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

type CreateDraftRoiUseCase struct {
	Repository     _interface.ICreateDraftRoiRepository
	ContextTimeout time.Duration
}

func NewCreateDraftRoiUseCase(repo _interface.ICreateDraftRoiRepository, timeout time.Duration) _interface.ICreateDraftRoiUseCase {
	return &CreateDraftRoiUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *CreateDraftRoiUseCase) CreateDraftRoi(c context.Context, projectID string, roiFileName string) error {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	fmt.Printf("CreateDraftRoi - Input roiFileName: %s\n", roiFileName)

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)

	// 원본 ROI 파일 경로 (json 파일)
	roiFolderPath := filepath.Join(projectPath, "uploads", "roi")

	// 파일명에 .json이 없으면 추가
	if !strings.HasSuffix(roiFileName, ".json") {
		roiFileName += ".json"
	}
	fmt.Printf("CreateDraftRoi - After adding .json: %s\n", roiFileName)
	roiFilePath := filepath.Join(roiFolderPath, roiFileName)
	fmt.Printf("CreateDraftRoi - Looking for file at: %s\n", roiFilePath)

	// ROI 파일 존재 확인
	if _, err := os.Stat(roiFilePath); os.IsNotExist(err) {
		return fmt.Errorf("ROI 파일을 찾을 수 없습니다: %s", roiFileName)
	}

	// draft 폴더 생성
	draftPath := filepath.Join(roiFolderPath, "draft")
	if err := os.MkdirAll(draftPath, 0755); err != nil {
		return fmt.Errorf("draft 폴더 생성 실패: %v", err)
	}

	// draft 파일명 생성 (timestamp 제거 후 _draft 추가)
	ext := filepath.Ext(roiFileName)
	nameWithoutExt := roiFileName[:len(roiFileName)-len(ext)]

	// timestamp 패턴 제거 (예: gogo_1767084153 → gogo)
	re := regexp.MustCompile(`_\d+$`)
	baseFileName := re.ReplaceAllString(nameWithoutExt, "")
	fmt.Printf("CreateDraftRoi - Base filename (without timestamp): %s\n", baseFileName)

	draftFileName := fmt.Sprintf("%s_draft%s", baseFileName, ext)
	draftFilePath := filepath.Join(draftPath, draftFileName)
	fmt.Printf("CreateDraftRoi - Draft file will be created at: %s\n", draftFilePath)

	// 기존 draft 파일이 있으면 삭제
	if _, err := os.Stat(draftFilePath); err == nil {
		if err := os.Remove(draftFilePath); err != nil {
			return fmt.Errorf("기존 draft 파일 삭제 실패: %v", err)
		}
	}

	// 파일 복사
	if err := copyFile(roiFilePath, draftFilePath); err != nil {
		return fmt.Errorf("파일 복사 실패: %v", err)
	}

	return nil
}
