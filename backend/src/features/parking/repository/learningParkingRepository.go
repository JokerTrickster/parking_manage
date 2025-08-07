package repository

import (
	"context"
	"main/common/db/mysql"
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

func NewLearningParkingRepository(gormDB *gorm.DB) _interface.ILearningParkingRepository {
	return &LearningParkingRepository{GormDB: gormDB}
}

func (r *LearningParkingRepository) CreateExperimentSession(ctx context.Context, experimentSession mysql.ExperimentSessions) (int, error) {
	result := r.GormDB.WithContext(ctx).Create(&experimentSession)
	if result.Error != nil {
		return 0, result.Error
	}
	return int(experimentSession.ID), nil
}

func (r *LearningParkingRepository) CreateCctvResult(ctx context.Context, cctvResult mysql.CctvResults) (int, error) {
	result := r.GormDB.WithContext(ctx).Create(&cctvResult)
	if result.Error != nil {
		return 0, result.Error
	}
	return int(cctvResult.ID), nil
}

func (r *LearningParkingRepository) CreateRoiResult(ctx context.Context, roiResult mysql.RoiResults) error {
	result := r.GormDB.WithContext(ctx).Create(&roiResult)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
