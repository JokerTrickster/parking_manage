package repository

import "gorm.io/gorm"

type LearningUploadParkingRepository struct {
	GormDB *gorm.DB
}

type TestUploadParkingRepository struct {
	GormDB *gorm.DB
}
