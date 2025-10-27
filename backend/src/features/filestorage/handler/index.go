package handler

import (
	"time"

	"main/features/filestorage/repository"
	"main/features/filestorage/usecase"

	"github.com/labstack/echo/v4"
)

// InitFileStorageHandlers initializes all file storage handlers
func InitFileStorageHandlers(e *echo.Echo) {
	// Create repository
	repo := repository.NewFileStorageRepository()

	// Create use cases
	timeout := 120 * time.Second
	fileStorageUseCase := usecase.NewFileStorageUseCase(repo, timeout)
	autoUploadUseCase := usecase.NewAutoUploadUseCase(repo, timeout)

	// Register handlers
	NewFileStorageHandler(e, fileStorageUseCase)
	NewAutoUploadHandler(e, autoUploadUseCase)
}
