package repository

import (
	_interface "main/features/roi/model/interface"

	"gorm.io/gorm"
)

func NewSaveDraftRoiRepository(db *gorm.DB) _interface.ISaveDraftRoiRepository {
	return &SaveDraftRoiRepository{GormDB: db}
}
