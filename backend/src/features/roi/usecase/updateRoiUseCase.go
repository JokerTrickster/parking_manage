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

type UpdateRoiUseCase struct {
	Repository     _interface.IUpdateRoiRepository
	ContextTimeout time.Duration
}

func NewUpdateRoiUseCase(repo _interface.IUpdateRoiRepository, timeout time.Duration) _interface.IUpdateRoiUseCase {
	return &UpdateRoiUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *UpdateRoiUseCase) UpdateRoi(c context.Context, projectID string, req request.UpdateRoiRequest) (response.ResUpdateRoi, error) {
	_, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)

	// draft 파일 경로
	roiFolderPath := filepath.Join(projectPath, "uploads", "roi")
	draftFileName := req.RoiFile + "_draft.json"
	draftFilePath := filepath.Join(roiFolderPath, "draft", draftFileName)

	// draft 파일 존재 확인
	if _, err := os.Stat(draftFilePath); os.IsNotExist(err) {
		return response.ResUpdateRoi{}, fmt.Errorf("draft 파일을 찾을 수 없습니다")
	}

	// JSON 파일 읽기
	fileData, err := os.ReadFile(draftFilePath)
	if err != nil {
		return response.ResUpdateRoi{}, fmt.Errorf("draft 파일 읽기 실패: %v", err)
	}

	// JSON 파싱
	var roiData map[string]interface{}
	if err := json.Unmarshal(fileData, &roiData); err != nil {
		return response.ResUpdateRoi{}, fmt.Errorf("JSON 파싱 실패: %v", err)
	}

	// CCTV ID에 해당하는 데이터 찾기
	cctvFound := false
	roiFound := false
	for ipAddr, cctvData := range roiData {
		if cctvMap, ok := cctvData.(map[string]interface{}); ok {
			if cctvID, ok := cctvMap["cctv_id"].(string); ok && cctvID == req.CctvID {
				cctvFound = true

				// matches 배열에서 ROI ID에 해당하는 항목 찾기
				if matches, ok := cctvMap["matches"].([]interface{}); ok {
					for i, match := range matches {
						if matchMap, ok := match.(map[string]interface{}); ok {
							if parkingID, ok := matchMap["parking_id"].(string); ok && parkingID == req.RoiID {
								roiFound = true
								// 좌표 업데이트
								matchMap["original_roi"] = req.Coords
								matchMap["img_center_roi"] = req.Coords

								// 수정된 데이터를 다시 배열에 저장
								matches[i] = matchMap
								cctvMap["matches"] = matches
								roiData[ipAddr] = cctvMap
								break
							}
						}
					}
				}
				break
			}
		}
	}

	if !cctvFound {
		return response.ResUpdateRoi{}, fmt.Errorf("CCTV ID를 찾을 수 없습니다: %s", req.CctvID)
	}

	if !roiFound {
		return response.ResUpdateRoi{}, fmt.Errorf("ROI ID를 찾을 수 없습니다: %s", req.RoiID)
	}

	// 수정된 JSON을 파일에 저장
	updatedData, err := json.MarshalIndent(roiData, "", "    ")
	if err != nil {
		return response.ResUpdateRoi{}, fmt.Errorf("JSON 마샬링 실패: %v", err)
	}

	if err := os.WriteFile(draftFilePath, updatedData, 0644); err != nil {
		return response.ResUpdateRoi{}, fmt.Errorf("파일 저장 실패: %v", err)
	}

	return response.ResUpdateRoi{
		Success: true,
		Message: "ROI가 성공적으로 수정되었습니다",
	}, nil
}
