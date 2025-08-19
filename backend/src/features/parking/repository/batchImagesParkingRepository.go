package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

type BatchImagesParkingRepository struct {
	GormDB *gorm.DB
}

func NewBatchImagesParkingRepository(gormDB *gorm.DB) _interface.IBatchImagesParkingRepository {
	return &BatchImagesParkingRepository{
		GormDB: gormDB,
	}
}
