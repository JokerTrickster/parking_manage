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
	createDraftRoiRepo := repository.NewCreateDraftRoiRepository(mysql.GormMysqlDB)
	getDraftRoiRepo := repository.NewGetDraftRoiRepository(mysql.GormMysqlDB)
	saveDraftRoiRepo := repository.NewSaveDraftRoiRepository(mysql.GormMysqlDB)
	// UseCase 초기화
	uploadRoiUseCase := usecase.NewUploadRoiUseCase(uploadRoiRepo, 30*time.Second)
	testStatsRoiUseCase := usecase.NewTestStatsRoiUseCase(testStatsRoiRepo, 30*time.Second)
	getDraftRoiUseCase := usecase.NewGetDraftRoiUseCase(getDraftRoiRepo, 30*time.Second)
	saveDraftRoiUseCase := usecase.NewSaveDraftRoiUseCase(saveDraftRoiRepo, 30*time.Second)
	createDraftRoiUseCase := usecase.NewCreateDraftRoiUseCase(createDraftRoiRepo, 30*time.Second)

	// Handler 초기화
	NewUploadRoiHandler(e, uploadRoiUseCase)
	NewTestStatsRoiHandler(e, testStatsRoiUseCase)
	NewCreateDraftRoiHandler(e, createDraftRoiUseCase)
	NewGetDraftRoiHandler(e, getDraftRoiUseCase)
	NewSaveDraftRoiHandler(e, saveDraftRoiUseCase)
	return nil
}
