package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

func NewLiveLearningParkingRepository(gormDB *gorm.DB) _interface.ILiveLearningParkingRepository {
	return &LiveLearningParkingRepository{GormDB: gormDB}
}
