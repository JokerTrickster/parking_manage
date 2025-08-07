package repository

import "gorm.io/gorm"

type LearningUploadParkingRepository struct {
	GormDB *gorm.DB
}

type TestUploadParkingRepository struct {
	GormDB *gorm.DB
}

type LearningStatsParkingRepository struct {
	GormDB *gorm.DB
}

type TestStatsParkingRepository struct {
	GormDB *gorm.DB
}

type RoiStatsParkingRepository struct {
	GormDB *gorm.DB
}

type RoiUploadParkingRepository struct {
	GormDB *gorm.DB
}

type LearningParkingRepository struct {
	GormDB *gorm.DB
}
