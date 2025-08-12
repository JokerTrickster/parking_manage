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

type CreateRoiRepository struct {
	GormDB *gorm.DB
}
type ReadRoiRepository struct {
	GormDB *gorm.DB
}
type UpdateRoiRepository struct {
	GormDB *gorm.DB
}

type DeleteRoiRepository struct {
	GormDB *gorm.DB
}
