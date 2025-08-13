package repository

import (
	_interface "main/features/roi/model/interface"

	"gorm.io/gorm"
)

func NewGetImageRoiRepository(db *gorm.DB) _interface.IGetImageRoiRepository {
	return &GetImageRoiRepository{GormDB: db}
}
