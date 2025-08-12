package repository

import (
	_interface "main/features/roi/model/interface"

	"gorm.io/gorm"
)

func NewTestStatsRoiRepository(gormDB *gorm.DB) _interface.ITestStatsRoiRepository {
	return &TestStatsRoiRepository{GormDB: gormDB}
}
