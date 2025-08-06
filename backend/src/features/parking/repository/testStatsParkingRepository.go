package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

func NewTestStatsParkingRepository(gormDB *gorm.DB) _interface.ITestStatsParkingRepository {
	return &TestStatsParkingRepository{GormDB: gormDB}
}
