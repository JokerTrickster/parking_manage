package usecase

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"

	_interface "main/features/parking/model/interface"
	"main/features/parking/model/request"
	"main/features/parking/model/response"
)

type LabelSaveParkingUseCase struct {
	Repository _interface.ILabelSaveParkingRepository
}

func NewLabelSaveParkingUseCase(repository _interface.ILabelSaveParkingRepository) _interface.ILabelSaveParkingUseCase {
	return &LabelSaveParkingUseCase{Repository: repository}
}

func (d *LabelSaveParkingUseCase) SaveLabels(ctx context.Context, projectID string, folderPath string, cctvID string, labels []request.LabelData) (response.ResSaveLabel, error) {
	// 현재 작업 디렉토리 가져오기
	currentDir, err := os.Getwd()
	if err != nil {
		return response.ResSaveLabel{}, nil
	}

	// 라벨 디렉토리 경로 구성

	labelDir := filepath.Join(currentDir, "..", "..", "shared", projectID, "uploads", "testImages", folderPath, "testImages")

	// 디렉토리가 없으면 생성
	if err := os.MkdirAll(labelDir, 0755); err != nil {
		return response.ResSaveLabel{}, nil
	}
	labelName := cctvID + "_labels.json"

	// 라벨 파일 경로
	labelFilePath := filepath.Join(labelDir, labelName)

	var responseImageLabels []response.SaveLabelData
	for _, label := range labels {
		responseImageLabels = append(responseImageLabels, response.SaveLabelData{
			RoiId:      label.RoiId,
			HasVehicle: label.HasVehicle,
		})
	}
	// JSON으로 직렬화
	data, err := json.MarshalIndent(responseImageLabels, "", "  ")
	if err != nil {
		return response.ResSaveLabel{}, nil
	}

	// 파일에 저장
	if err := os.WriteFile(labelFilePath, data, 0644); err != nil {
		return response.ResSaveLabel{}, nil
	}

	return response.ResSaveLabel{
		Labels: responseImageLabels,
	}, nil
}
