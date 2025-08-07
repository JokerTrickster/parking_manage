package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

func NewRoiUploadParkingRepository(gormDB *gorm.DB) _interface.IRoiUploadParkingRepository {
	return &RoiUploadParkingRepository{GormDB: gormDB}
}
