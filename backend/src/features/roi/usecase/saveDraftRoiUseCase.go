package usecase

import (
	"context"
	"fmt"
	"main/common"
	_interface "main/features/roi/model/interface"
	"main/features/roi/model/response"
	"os"
	"path/filepath"
	"regexp"
	"time"
)

type SaveDraftRoiUseCase struct {
	Repository     _interface.ISaveDraftRoiRepository
	ContextTimeout time.Duration
}

func NewSaveDraftRoiUseCase(repo _interface.ISaveDraftRoiRepository, timeout time.Duration) _interface.ISaveDraftRoiUseCase {
	return &SaveDraftRoiUseCase{Repository: repo, ContextTimeout: timeout}
}

// findLatestDraftFile finds the latest draft file matching the base filename
func findLatestDraftFile(folderPath, baseFileName string) (string, error) {
	entries, err := os.ReadDir(folderPath)
	if err != nil {
		return "", fmt.Errorf("폴더를 읽을 수 없습니다: %v", err)
	}

	var matchedFiles []os.DirEntry
	exactMatch := baseFileName + "_draft.json"

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		fileName := entry.Name()

		// Exact match: {baseFileName}_draft.json
		if fileName == exactMatch {
			matchedFiles = append(matchedFiles, entry)
			continue
		}

		// Timestamp match: {baseFileName}_{timestamp}_draft.json
		if len(fileName) > len(baseFileName) && fileName[:len(baseFileName)] == baseFileName {
			suffix := fileName[len(baseFileName):]
			re := regexp.MustCompile(`^_\d+_draft\.json$`)
			if re.MatchString(suffix) {
				matchedFiles = append(matchedFiles, entry)
			}
		}
	}

	if len(matchedFiles) == 0 {
		return "", fmt.Errorf("draft 파일을 찾을 수 없습니다: %s", baseFileName+"_draft.json")
	}

	// Find latest by modification time
	var latestFile os.DirEntry
	var latestTime time.Time
	for _, file := range matchedFiles {
		info, err := file.Info()
		if err != nil {
			continue
		}
		if latestFile == nil || info.ModTime().After(latestTime) {
			latestFile = file
			latestTime = info.ModTime()
		}
	}

	if latestFile == nil {
		return "", fmt.Errorf("파일 정보를 가져올 수 없습니다")
	}

	return filepath.Join(folderPath, latestFile.Name()), nil
}

// SaveDraftRoi 초안 JSON 파일을 현재 날짜를 붙여서 roi 폴더에 저장
func (d *SaveDraftRoiUseCase) SaveDraftRoi(c context.Context, projectID string, roiFileName string) (response.ResSaveDraft, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	fmt.Printf("SaveDraftRoi - Input roiFileName: %s\n", roiFileName)

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)

	// draft 파일 경로
	roiFolderPath := filepath.Join(projectPath, "uploads", "roi")
	draftFolderPath := filepath.Join(roiFolderPath, "draft")

	// .json 확장자 제거
	ext := filepath.Ext(roiFileName)
	baseFileName := roiFileName
	if ext == ".json" {
		baseFileName = roiFileName[:len(roiFileName)-len(ext)]
	}

	// timestamp 패턴 제거 (예: gogo_1736708415 → gogo)
	// 파일명 끝에 _숫자 형태가 있으면 제거
	re := regexp.MustCompile(`_\d+$`)
	baseFileName = re.ReplaceAllString(baseFileName, "")
	fmt.Printf("SaveDraftRoi - After removing timestamp: %s\n", baseFileName)

	// draft 폴더에서 최신 draft 파일 찾기
	draftFilePath, err := findLatestDraftFile(draftFolderPath, baseFileName)
	if err != nil {
		return response.ResSaveDraft{}, fmt.Errorf("초안 저장 중 오류가 발생했습니다: %v", err)
	}
	fmt.Printf("SaveDraftRoi - Found draft file at: %s\n", draftFilePath)

	// 현재 timestamp로 새 파일명 생성
	now := time.Now()
	timestamp := now.Unix()
	savedFileName := fmt.Sprintf("%s_%d.json", baseFileName, timestamp)
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
