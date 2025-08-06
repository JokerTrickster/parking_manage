package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

func NewLearningStatsParkingRepository(gormDB *gorm.DB) _interface.ILearningStatsParkingRepository {
	return &LearningStatsParkingRepository{GormDB: gormDB}
}
