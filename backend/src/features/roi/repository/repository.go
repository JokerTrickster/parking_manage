package repository

import (
	"gorm.io/gorm"
)

type UploadRoiRepository struct {
	GormDB *gorm.DB
}

type TestStatsRoiRepository struct {
	GormDB *gorm.DB
}

type CreateDraftRoiRepository struct {
	GormDB *gorm.DB
}
type GetDraftRoiRepository struct {
	GormDB *gorm.DB
}
type SaveDraftRoiRepository struct {
	GormDB *gorm.DB
}
