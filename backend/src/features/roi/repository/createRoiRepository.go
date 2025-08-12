package repository

import (
	_interface "main/features/roi/model/interface"

	"gorm.io/gorm"
)

func NewCreateRoiRepository(db *gorm.DB) _interface.ICreateRoiRepository {
	return &CreateRoiRepository{GormDB: db}
}
