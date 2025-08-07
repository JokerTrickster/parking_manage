package handler

import (
	"main/common/db/mysql"
	"main/features/parking/repository"
	"main/features/parking/usecase"

	"github.com/labstack/echo/v4"
)

func NewParkingHandler(e *echo.Echo) {
	NewLearningUploadParkingHandler(e, usecase.NewLearningUploadParkingUseCase(repository.NewLearningUploadParkingRepository(mysql.GormMysqlDB), mysql.DBTimeOut))
	NewTestUploadParkingHandler(e, usecase.NewTestUploadParkingUseCase(repository.NewTestUploadParkingRepository(mysql.GormMysqlDB), mysql.DBTimeOut))
	NewRoiUploadParkingHandler(e, usecase.NewRoiUploadParkingUseCase(repository.NewRoiUploadParkingRepository(mysql.GormMysqlDB), mysql.DBTimeOut))
	NewLearningStatsParkingHandler(e, usecase.NewLearningStatsParkingUseCase(repository.NewLearningStatsParkingRepository(mysql.GormMysqlDB), mysql.DBTimeOut))
	NewTestStatsParkingHandler(e, usecase.NewTestStatsParkingUseCase(repository.NewTestStatsParkingRepository(mysql.GormMysqlDB), mysql.DBTimeOut))
	NewRoiStatsParkingHandler(e, usecase.NewRoiStatsParkingUseCase(repository.NewRoiStatsParkingRepository(mysql.GormMysqlDB), mysql.DBTimeOut))
}
