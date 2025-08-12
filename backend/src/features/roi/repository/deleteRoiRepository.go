package repository

import (
	_interface "main/features/roi/model/interface"

	"gorm.io/gorm"
)

func NewDeleteRoiRepository(db *gorm.DB) _interface.IDeleteRoiRepository {
	return &DeleteRoiRepository{GormDB: db}
}
