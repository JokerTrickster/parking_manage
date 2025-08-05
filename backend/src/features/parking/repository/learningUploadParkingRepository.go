package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

func NewLearningUploadParkingRepository(gormDB *gorm.DB) _interface.ILearningUploadParkingRepository {
	return &LearningUploadParkingRepository{GormDB: gormDB}
}
