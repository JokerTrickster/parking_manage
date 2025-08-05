package handler

import (
	"main/common/db/mysql"
	"main/features/parking/repository"
	"main/features/parking/usecase"

	"github.com/labstack/echo/v4"
)

func NewParkingHandler(c *echo.Echo) {
	NewLearningUploadParkingHandler(c, usecase.NewLearningUploadParkingUseCase(repository.NewLearningUploadParkingRepository(mysql.GormMysqlDB), mysql.DBTimeOut))
}
