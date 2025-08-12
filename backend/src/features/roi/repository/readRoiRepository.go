package repository

import (
	_interface "main/features/roi/model/interface"

	"gorm.io/gorm"
)

func NewReadRoiRepository(db *gorm.DB) _interface.IReadRoiRepository {
	return &ReadRoiRepository{GormDB: db}
}
