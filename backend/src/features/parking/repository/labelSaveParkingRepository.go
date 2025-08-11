package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

func NewLabelSaveParkingRepository(gormDB *gorm.DB) _interface.ILabelSaveParkingRepository {
	return &LabelSaveParkingRepository{GormDB: gormDB}
}
