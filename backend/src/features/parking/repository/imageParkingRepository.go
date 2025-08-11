package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

type ImageParkingRepository struct {
	GormDB *gorm.DB
}

func NewImageParkingRepository(gormDB *gorm.DB) _interface.IImageParkingRepository {
	return &ImageParkingRepository{
		GormDB: gormDB,
	}
}

// 현재는 이미지 파일을 직접 읽으므로 DB 작업이 필요하지 않음
// 향후 이미지 메타데이터를 DB에 저장할 경우 여기에 메서드 추가
