package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"main/common"
	_interface "main/features/roi/model/interface"
	"main/features/roi/model/request"
	"main/features/roi/model/response"
	"os"
	"path/filepath"
	"time"
)

type ReadRoiUseCase struct {
	Repository     _interface.IReadRoiRepository
	ContextTimeout time.Duration
}

func NewReadRoiUseCase(repo _interface.IReadRoiRepository, timeout time.Duration) _interface.IReadRoiUseCase {
	return &ReadRoiUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *ReadRoiUseCase) ReadRoi(c context.Context, projectID string, req request.ReadRoiRequest) (response.ResReadRoi, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)

	// ROI 파일 경로 설정
	roiFolderPath := filepath.Join(projectPath, "uploads", "roi")

	// 먼저 draft 파일 확인
	draftFileName := req.RoiFile + "_draft.json"
	draftFilePath := filepath.Join(roiFolderPath, "draft", draftFileName)

	var fileData []byte
	var err error

	// draft 파일 존재 확인
	if _, err := os.Stat(draftFilePath); err == nil {
		// draft 파일이 있으면 draft 파일 사용
		fileData, err = os.ReadFile(draftFilePath)
	} else {
		// draft 파일이 없으면 원본 파일 사용
		originalFileName := req.RoiFile + ".json"
		originalFilePath := filepath.Join(roiFolderPath, originalFileName)

		// 원본 파일 존재 확인
		if _, err := os.Stat(originalFilePath); os.IsNotExist(err) {
			return response.ResReadRoi{}, fmt.Errorf("ROI 파일을 찾을 수 없습니다: %s", originalFileName)
		}

		fileData, err = os.ReadFile(originalFilePath)
	}
	if err != nil {
		return response.ResReadRoi{}, fmt.Errorf("ROI 파일 읽기 실패: %v", err)
	}

	// JSON 파싱
	var roiData map[string]interface{}
	if err := json.Unmarshal(fileData, &roiData); err != nil {
		return response.ResReadRoi{}, fmt.Errorf("JSON 파싱 실패: %v", err)
	}

	// 응답 데이터 구성 (CCTV ID에서 _Current 제거)
	responseCctvID := req.CctvID
	if len(responseCctvID) > 8 && responseCctvID[len(responseCctvID)-8:] == "_Current" {
		responseCctvID = responseCctvID[:len(responseCctvID)-8]
	}

	result := response.ResReadRoi{
		CctvID: responseCctvID,
		Rois:   make(map[string][]interface{}),
	}

	// CCTV ID에 해당하는 데이터 찾기 (CCTV ID에서 _Current 제거)
	cctvFound := false
	// 요청된 CCTV ID에서 _Current 제거
	requestedCctvID := req.CctvID
	if len(requestedCctvID) > 8 && requestedCctvID[len(requestedCctvID)-8:] == "_Current" {
		requestedCctvID = requestedCctvID[:len(requestedCctvID)-8]
	}

	for _, cctvData := range roiData {
		if cctvMap, ok := cctvData.(map[string]interface{}); ok {
			if cctvID, ok := cctvMap["cctv_id"].(string); ok {
				// 파일의 CCTV ID에서도 _Current 제거
				fileCctvID := cctvID
				if len(fileCctvID) > 8 && fileCctvID[len(fileCctvID)-8:] == "_Current" {
					fileCctvID = fileCctvID[:len(fileCctvID)-8]
				}

				if fileCctvID == requestedCctvID {
					cctvFound = true

					// matches 배열에서 각 ROI의 좌표 추출
					if matches, ok := cctvMap["matches"].([]interface{}); ok {
						for _, match := range matches {
							if matchMap, ok := match.(map[string]interface{}); ok {
								if parkingID, ok := matchMap["parking_id"].(string); ok {
									// ROI 좌표 추출 (original_roi 또는 img_center_roi)
									if originalRoi, ok := matchMap["original_roi"].([]interface{}); ok {
										result.Rois[parkingID] = originalRoi
									} else if imgCenterRoi, ok := matchMap["img_center_roi"].([]interface{}); ok {
										result.Rois[parkingID] = imgCenterRoi
									}
								}
							}
						}
					}
					break
				}
			}
		}
	}

	if !cctvFound {
		return response.ResReadRoi{}, fmt.Errorf("CCTV ID를 찾을 수 없습니다: %s", req.CctvID)
	}

	return result, nil
}
