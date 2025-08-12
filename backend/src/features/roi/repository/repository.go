package repository

import "gorm.io/gorm"

type UploadRoiRepository struct {
	GormDB *gorm.DB
}

type TestStatsRoiRepository struct {
	GormDB *gorm.DB
}
