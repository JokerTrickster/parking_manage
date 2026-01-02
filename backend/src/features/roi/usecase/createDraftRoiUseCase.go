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

	// .json 확장자 제거하여 베이스 파일명 추출
	baseFileName := roiFileName
	if strings.HasSuffix(roiFileName, ".json") {
		baseFileName = roiFileName[:len(roiFileName)-4]
	}

	// timestamp 패턴 제거 (예: gogo_1767084153 → gogo)
	re := regexp.MustCompile(`_\d+$`)
	baseFileName = re.ReplaceAllString(baseFileName, "")
	fmt.Printf("CreateDraftRoi - Base filename: %s\n", baseFileName)

	// 베이스 파일명과 매칭되는 파일 찾기 (타임스탬프가 붙은 파일 포함)
	// 패턴: {baseFileName}.json 또는 {baseFileName}_{timestamp}.json
	roiFilePath, err := findLatestMatchingFile(roiFolderPath, baseFileName)
	if err != nil {
		return fmt.Errorf("ROI 파일을 찾을 수 없습니다: %s (%v)", baseFileName, err)
	}
	fmt.Printf("CreateDraftRoi - Found file at: %s\n", roiFilePath)

	// draft 폴더 생성
	draftPath := filepath.Join(roiFolderPath, "draft")
	if err := os.MkdirAll(draftPath, 0755); err != nil {
		return fmt.Errorf("draft 폴더 생성 실패: %v", err)
	}

	// draft 파일명 생성 (baseFileName + _draft.json)
	draftFileName := fmt.Sprintf("%s_draft.json", baseFileName)
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

// findLatestMatchingFile finds the latest file matching the base filename
// Matches: {baseFileName}.json or {baseFileName}_{timestamp}.json
func findLatestMatchingFile(folderPath, baseFileName string) (string, error) {
	// Read directory
	entries, err := os.ReadDir(folderPath)
	if err != nil {
		return "", fmt.Errorf("폴더를 읽을 수 없습니다: %v", err)
	}

	var matchedFiles []os.DirEntry
	exactMatch := baseFileName + ".json"

	// Find all files matching the pattern
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		fileName := entry.Name()

		// Exact match: {baseFileName}.json
		if fileName == exactMatch {
			matchedFiles = append(matchedFiles, entry)
			continue
		}

		// Timestamp match: {baseFileName}_{timestamp}.json
		if strings.HasPrefix(fileName, baseFileName+"_") && strings.HasSuffix(fileName, ".json") {
			// Verify it's actually a timestamp pattern
			nameWithoutExt := fileName[:len(fileName)-5] // Remove .json
			suffix := nameWithoutExt[len(baseFileName):]  // Get the _timestamp part

			// Check if suffix matches _\d+ pattern
			re := regexp.MustCompile(`^_\d+$`)
			if re.MatchString(suffix) {
				matchedFiles = append(matchedFiles, entry)
			}
		}
	}

	if len(matchedFiles) == 0 {
		return "", fmt.Errorf("매칭되는 파일이 없습니다 (패턴: %s.json 또는 %s_*.json)", baseFileName, baseFileName)
	}

	// Find the latest file by modification time
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
