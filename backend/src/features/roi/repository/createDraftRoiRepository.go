package repository

import (
	_interface "main/features/roi/model/interface"

	"gorm.io/gorm"
)

func NewCreateDraftRoiRepository(db *gorm.DB) _interface.ICreateDraftRoiRepository {
	return &CreateDraftRoiRepository{GormDB: db}
}
