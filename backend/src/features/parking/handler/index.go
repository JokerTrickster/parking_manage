package handler

import (
	"main/common/db/mysql"
	"main/features/parking/repository"
	"main/features/parking/usecase"
	"time"

	"github.com/labstack/echo/v4"
)

func NewParkingHandler(e *echo.Echo) error {
	// Repository 초기화
	learningUploadRepo := repository.NewLearningUploadParkingRepository(mysql.GormMysqlDB)
	testUploadRepo := repository.NewTestUploadParkingRepository(mysql.GormMysqlDB)
	roiUploadRepo := repository.NewRoiUploadParkingRepository(mysql.GormMysqlDB)
	learningStatsRepo := repository.NewLearningStatsParkingRepository(mysql.GormMysqlDB)
	testStatsRepo := repository.NewTestStatsParkingRepository(mysql.GormMysqlDB)
	roiStatsRepo := repository.NewRoiStatsParkingRepository(mysql.GormMysqlDB)
	learningRepo := repository.NewLearningParkingRepository(mysql.GormMysqlDB)
	learningResultsRepo := repository.NewLearningResultsParkingRepository()
	cctvImagesRepo := repository.NewCctvImagesParkingRepository()
	imageRepo := repository.NewImageParkingRepository(mysql.GormMysqlDB)

	// UseCase 초기화
	learningUploadUseCase := usecase.NewLearningUploadParkingUseCase(learningUploadRepo, 30*time.Second)
	testUploadUseCase := usecase.NewTestUploadParkingUseCase(testUploadRepo, 30*time.Second)
	roiUploadUseCase := usecase.NewRoiUploadParkingUseCase(roiUploadRepo, 30*time.Second)
	learningStatsUseCase := usecase.NewLearningStatsParkingUseCase(learningStatsRepo, 30*time.Second)
	testStatsUseCase := usecase.NewTestStatsParkingUseCase(testStatsRepo, 30*time.Second)
	roiStatsUseCase := usecase.NewRoiStatsParkingUseCase(roiStatsRepo, 30*time.Second)
	learningUseCase := usecase.NewLearningParkingUseCase(learningRepo, 300*time.Second)
	learningResultsUseCase := usecase.NewLearningResultsParkingUseCase(learningResultsRepo, 30*time.Second)
	cctvImagesUseCase := usecase.NewCctvImagesParkingUseCase(cctvImagesRepo, 30*time.Second)
	imageUseCase := usecase.NewImageParkingUseCase(imageRepo, 30*time.Second)

	// Handler 초기화
	NewLearningUploadParkingHandler(e, learningUploadUseCase)
	NewTestUploadParkingHandler(e, testUploadUseCase)
	NewRoiUploadParkingHandler(e, roiUploadUseCase)
	NewLearningStatsParkingHandler(e, learningStatsUseCase)
	NewTestStatsParkingHandler(e, testStatsUseCase)
	NewRoiStatsParkingHandler(e, roiStatsUseCase)
	NewLearningParkingHandler(e, learningUseCase)
	NewLearningResultsParkingHandler(e, learningResultsUseCase)
	NewImageParkingHandler(e, imageUseCase)
	NewCctvImagesParkingHandler(e, cctvImagesUseCase)
	return nil
}
