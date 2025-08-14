package repository

import (
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

type DeleteFileParkingRepository struct {
	GormDB *gorm.DB
}

func NewDeleteFileParkingRepository(gormDB *gorm.DB) _interface.IDeleteFileParkingRepository {
	return &DeleteFileParkingRepository{GormDB: gormDB}
}
