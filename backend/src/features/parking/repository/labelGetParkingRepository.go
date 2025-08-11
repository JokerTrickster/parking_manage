package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

func NewLabelGetParkingRepository(gormDB *gorm.DB) _interface.ILabelGetParkingRepository {
	return &LabelGetParkingRepository{GormDB: gormDB}
}
