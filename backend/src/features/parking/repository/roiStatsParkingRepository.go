package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

func NewRoiStatsParkingRepository(gormDB *gorm.DB) _interface.IRoiStatsParkingRepository {
	return &RoiStatsParkingRepository{GormDB: gormDB}
}
