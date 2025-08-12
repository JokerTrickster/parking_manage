package handler

import (
	"main/common/db/mysql"
	"main/features/roi/repository"
	"main/features/roi/usecase"
	"time"

	"github.com/labstack/echo/v4"
)

func NewRoiHandler(e *echo.Echo) error {
	// Repository 초기화
	uploadRoiRepo := repository.NewUploadRoiRepository(mysql.GormMysqlDB)
	testStatsRoiRepo := repository.NewTestStatsRoiRepository(mysql.GormMysqlDB)
	draftRoiRepo := repository.NewDraftRoiRepository(mysql.GormMysqlDB)
	// UseCase 초기화
	uploadRoiUseCase := usecase.NewUploadRoiUseCase(uploadRoiRepo, 30*time.Second)
	testStatsRoiUseCase := usecase.NewTestStatsRoiUseCase(testStatsRoiRepo, 30*time.Second)
	draftRoiUseCase := usecase.NewDraftRoiUseCase(draftRoiRepo, 30*time.Second)
	// Handler 초기화
	NewUploadRoiHandler(e, uploadRoiUseCase)
	NewTestStatsRoiHandler(e, testStatsRoiUseCase)
	NewDraftRoiHandler(e, draftRoiUseCase)

	return nil
}
