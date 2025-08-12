package repository

import (
	_interface "main/features/roi/model/interface"

	"gorm.io/gorm"
)

func NewDraftRoiRepository(db *gorm.DB) _interface.IDraftRoiRepository {
	return &DraftRoiRepository{GormDB: db}
}
