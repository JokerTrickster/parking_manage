package usecase

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"

	_interface "main/features/parking/model/interface"
	"main/features/parking/model/response"
)

type LabelGetParkingUseCase struct {
	Repository _interface.ILabelGetParkingRepository
}

func NewLabelGetParkingUseCase(repository _interface.ILabelGetParkingRepository) _interface.ILabelGetParkingUseCase {
	return &LabelGetParkingUseCase{Repository: repository}
}

func (d *LabelGetParkingUseCase) GetLabels(ctx context.Context, projectID string, folderPath string, cctvID string) (response.ResGetLabel, error) {
	// 현재 작업 디렉토리 가져오기
	currentDir, err := os.Getwd()
	if err != nil {
		return response.ResGetLabel{}, nil
	}

	labelName := cctvID + "_labels.json"
	// 라벨 파일 경로 구성
	labelFilePath := filepath.Join(currentDir, "..", "..", "shared", projectID, "uploads", "testImages", folderPath, "testImages", labelName)

	// 파일이 존재하는지 확인
	if _, err := os.Stat(labelFilePath); os.IsNotExist(err) {
		// 파일이 없으면 빈 데이터 반환
		return response.ResGetLabel{}, nil
	}

	// 파일 읽기
	data, err := os.ReadFile(labelFilePath)
	if err != nil {
		return response.ResGetLabel{}, nil
	}

	// JSON 파싱
	var labels []response.GetLabelData
	if err := json.Unmarshal(data, &labels); err != nil {
		return response.ResGetLabel{}, nil
	}

	return response.ResGetLabel{
		Labels: labels,
	}, nil
}
