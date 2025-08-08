package repository

import (
	"context"
	_interface "main/features/parking/model/interface"
	"main/features/parking/model/response"
)

type LearningResultsParkingRepository struct {
	// 필요한 경우 DB 연결 등을 추가
}

func NewLearningResultsParkingRepository() _interface.ILearningResultsParkingRepository {
	return &LearningResultsParkingRepository{}
}

func (r *LearningResultsParkingRepository) GetLearningResults(ctx context.Context, projectID string, timestamp string) (response.ResLearningResults, error) {
	// UseCase에서 이미 구현했으므로 여기서는 단순히 UseCase를 호출
	// 실제로는 DB 조회 로직이 들어갈 수 있음
	return response.ResLearningResults{}, nil
}
