package repository

import "gorm.io/gorm"

type LearningUploadParkingRepository struct {
	GormDB *gorm.DB
}
