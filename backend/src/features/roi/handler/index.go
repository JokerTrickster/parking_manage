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
	createRoiRepo := repository.NewCreateRoiRepository(mysql.GormMysqlDB)
	readRoiRepo := repository.NewReadRoiRepository(mysql.GormMysqlDB)
	updateRoiRepo := repository.NewUpdateRoiRepository(mysql.GormMysqlDB)
	deleteRoiRepo := repository.NewDeleteRoiRepository(mysql.GormMysqlDB)
	// UseCase 초기화
	uploadRoiUseCase := usecase.NewUploadRoiUseCase(uploadRoiRepo, 30*time.Second)
	testStatsRoiUseCase := usecase.NewTestStatsRoiUseCase(testStatsRoiRepo, 30*time.Second)
	getDraftRoiUseCase := usecase.NewGetDraftRoiUseCase(getDraftRoiRepo, 30*time.Second)
	saveDraftRoiUseCase := usecase.NewSaveDraftRoiUseCase(saveDraftRoiRepo, 30*time.Second)
	createDraftRoiUseCase := usecase.NewCreateDraftRoiUseCase(createDraftRoiRepo, 30*time.Second)
	createRoiUseCase := usecase.NewCreateRoiUseCase(createRoiRepo, 30*time.Second)
	readRoiUseCase := usecase.NewReadRoiUseCase(readRoiRepo, 30*time.Second)
	updateRoiUseCase := usecase.NewUpdateRoiUseCase(updateRoiRepo, 30*time.Second)
	deleteRoiUseCase := usecase.NewDeleteRoiUseCase(deleteRoiRepo, 30*time.Second)

	// Handler 초기화
	NewUploadRoiHandler(e, uploadRoiUseCase)
	NewTestStatsRoiHandler(e, testStatsRoiUseCase)
	NewCreateDraftRoiHandler(e, createDraftRoiUseCase)
	NewGetDraftRoiHandler(e, getDraftRoiUseCase)
	NewSaveDraftRoiHandler(e, saveDraftRoiUseCase)
	NewCreateRoiHandler(e, createRoiUseCase)
	NewReadRoiHandler(e, readRoiUseCase)
	NewUpdateRoiHandler(e, updateRoiUseCase)
	NewDeleteRoiHandler(e, deleteRoiUseCase)
	return nil
}
