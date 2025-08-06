package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

func NewTestUploadParkingRepository(gormDB *gorm.DB) _interface.ITestUploadParkingRepository {
	return &TestUploadParkingRepository{GormDB: gormDB}
}
