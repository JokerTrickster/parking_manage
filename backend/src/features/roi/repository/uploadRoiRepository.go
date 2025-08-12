package repository

import (
	_interface "main/features/roi/model/interface"

	"gorm.io/gorm"
)

func NewUploadRoiRepository(gormDB *gorm.DB) _interface.IUploadRoiRepository {
	return &UploadRoiRepository{GormDB: gormDB}
}
