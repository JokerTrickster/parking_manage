package repository

import (
	"context"

	"main/common/db/mysql"
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

type HistoryParkingRepository struct {
	GormDB *gorm.DB
}

func NewHistoryParkingRepository(gormDB *gorm.DB) _interface.IHistoryParkingRepository {
	return &HistoryParkingRepository{
		GormDB: gormDB,
	}
}

func (r *HistoryParkingRepository) GetHistory(ctx context.Context, projectID string) ([]mysql.ExperimentSessions, error) {
	var experimentSessions []mysql.ExperimentSessions
	result := r.GormDB.WithContext(ctx).Where("project_id = ?", projectID).Find(&experimentSessions)
	if result.Error != nil {
		return nil, result.Error
	}

	return experimentSessions, nil
}

func (r *HistoryParkingRepository) FindCctvResultByExperimentSessionID(ctx context.Context, experimentSessionID int) ([]string, error) {
	var cctvResults []mysql.CctvResults
	result := r.GormDB.WithContext(ctx).Where("experiment_session_id = ?", experimentSessionID).Find(&cctvResults)
	if result.Error != nil {
		return nil, result.Error
	}

	var cctvIDs []string
	for _, cctvResult := range cctvResults {
		cctvIDs = append(cctvIDs, cctvResult.CctvId)
	}

	return cctvIDs, nil
}
