package usecase

import (
	"context"
	"strings"
	"time"

	_interface "main/features/parking/model/interface"
	"main/features/parking/model/response"
)

type HistoryParkingUseCase struct {
	Repository     _interface.IHistoryParkingRepository
	ContextTimeout time.Duration
}

func NewHistoryParkingUseCase(repo _interface.IHistoryParkingRepository, timeout time.Duration) _interface.IHistoryParkingUseCase {
	return &HistoryParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *HistoryParkingUseCase) GetHistory(ctx context.Context, projectID string) (response.ResHistory, error) {
	_, cancel := context.WithTimeout(ctx, d.ContextTimeout)
	defer cancel()

	history, err := d.Repository.GetHistory(ctx, projectID)
	if err != nil {
		return response.ResHistory{}, err
	}

	var historyItems []response.HistoryItem
	for _, item := range history {
		cctvResults, err := d.Repository.FindCctvResultByExperimentSessionID(ctx, int(item.ID))
		if err != nil {
			return response.ResHistory{}, err
		}
		// 결과 폴더 경로 생성
		resultPath := strings.Replace(item.LearningPath, "uploads/learningImages", "results", 1)
		resultPath += "/" + item.Name

		historyItem := response.HistoryItem{
			Id:           int(item.ID),
			Name:         item.Name,
			CreatedAt:    item.CreatedAt.Format(time.RFC3339),
			FolderPath:   resultPath,
			Epoch:        int(item.Iterations),
			LearningRate: item.LearningRate,
			VarThreshold: item.VarThreshold,
			CctvList:     cctvResults,
		}

		historyItems = append(historyItems, historyItem)
	}

	return response.ResHistory{
		Results: historyItems,
	}, nil
}
