package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

func NewCctvImageParkingRepository(gormDB *gorm.DB) _interface.ICctvImageParkingRepository {
	return &CctvImageParkingRepository{GormDB: gormDB}
}
