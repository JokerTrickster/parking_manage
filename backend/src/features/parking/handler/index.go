package handler

import (
	"main/common/db/mysql"
	"main/features/parking/repository"
	"main/features/parking/usecase"

	"github.com/labstack/echo/v4"
)

func NewParkingHandler(e *echo.Echo) {
	NewLearningUploadParkingHandler(e, usecase.NewLearningUploadParkingUseCase(repository.NewLearningUploadParkingRepository(mysql.GormMysqlDB), mysql.DBTimeOut))
}
