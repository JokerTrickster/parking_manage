package repository

import (
	_interface "main/features/roi/model/interface"

	"gorm.io/gorm"
)

func NewGetDraftRoiRepository(db *gorm.DB) _interface.IGetDraftRoiRepository {
	return &GetDraftRoiRepository{GormDB: db}
}
