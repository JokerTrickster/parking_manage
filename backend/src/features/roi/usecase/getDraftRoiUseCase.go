package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"main/common"
	_interface "main/features/roi/model/interface"
	"main/features/roi/model/response"
	"os"
	"path/filepath"
	"time"
)

type GetDraftRoiUseCase struct {
	Repository     _interface.IGetDraftRoiRepository
	ContextTimeout time.Duration
}

func NewGetDraftRoiUseCase(repo _interface.IGetDraftRoiRepository, timeout time.Duration) _interface.IGetDraftRoiUseCase {
	return &GetDraftRoiUseCase{Repository: repo, ContextTimeout: timeout}
}

// GetDraftRoi 초안 JSON 파일을 읽어서 필요한 정보만 응답
func (d *GetDraftRoiUseCase) GetDraftRoi(c context.Context, projectID string, roiFileName string) (response.ResDraftRoi, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)

	// draft 파일 경로
	roiFolderPath := filepath.Join(projectPath, "uploads", "roi")
	roiFileName += "_draft.json"
	draftFilePath := filepath.Join(roiFolderPath, "draft", roiFileName)
	fmt.Println("draftFilePath: ", draftFilePath)
	fmt.Println("roiFileName: ", roiFileName)
	// draft 파일 존재 확인
	if _, err := os.Stat(draftFilePath); os.IsNotExist(err) {
		return response.ResDraftRoi{}, fmt.Errorf("draft 파일을 찾을 수 없습니다: %s", roiFileName)
	}

	// JSON 파일 읽기
	fileData, err := os.ReadFile(draftFilePath)
	if err != nil {
		return response.ResDraftRoi{}, fmt.Errorf("draft 파일 읽기 실패: %v", err)
	}

	// JSON 파싱
	var roiData map[string]interface{}
	if err := json.Unmarshal(fileData, &roiData); err != nil {
		return response.ResDraftRoi{}, fmt.Errorf("JSON 파싱 실패: %v", err)
	}

	// 응답 데이터 구성
	var result response.ResDraftRoi

	// 각 IP 주소(키)를 순회
	for _, cctvData := range roiData {
		if cctvMap, ok := cctvData.(map[string]interface{}); ok {
			// cctv_id 추출
			cctvID, _ := cctvMap["cctv_id"].(string)

			// matches 배열 처리
			if matches, ok := cctvMap["matches"].([]interface{}); ok {
				for _, match := range matches {
					if matchMap, ok := match.(map[string]interface{}); ok {
						cctvInfo := response.CctvRoiInfo{
							CctvID: cctvID,
						}

						// parking_id 추출
						if parkingID, ok := matchMap["parking_id"].(string); ok {
							cctvInfo.ParkingID = parkingID
						}

						// ROI 좌표 추출 (original_roi 또는 img_center_roi)
						if originalRoi, ok := matchMap["original_roi"].([]interface{}); ok {
							cctvInfo.RoiCoords = originalRoi
						} else if imgCenterRoi, ok := matchMap["img_center_roi"].([]interface{}); ok {
							cctvInfo.RoiCoords = imgCenterRoi
						}

						result.CctvList = append(result.CctvList, cctvInfo)
					}
				}
			}
		}
	}

	return result, nil
}
