package repository

import (
	_interface "main/features/roi/model/interface"

	"gorm.io/gorm"
)

func NewUpdateRoiRepository(db *gorm.DB) _interface.IUpdateRoiRepository {
	return &UpdateRoiRepository{GormDB: db}
}
