package handler

import (
	"fmt"
	"time"

	"main/common/db/mysql"
	"main/features/filestorage/repository"
	"main/features/filestorage/usecase"

	"github.com/labstack/echo/v4"
)

// InitFileStorageHandlers initializes all file storage handlers
func InitFileStorageHandlers(e *echo.Echo) {
	// Get database instance
	db := mysql.GormMysqlDB

	if db == nil {
		fmt.Println("ERROR: GormMysqlDB is nil in InitFileStorageHandlers!")
	} else {
		fmt.Println("SUCCESS: GormMysqlDB is connected in InitFileStorageHandlers")
	}

	// Create repository with DB
	repo := repository.NewFileStorageRepository(db)

	// Create use cases
	timeout := 120 * time.Second
	fileStorageUseCase := usecase.NewFileStorageUseCase(repo, timeout)
	autoUploadUseCase := usecase.NewAutoUploadUseCase(repo, timeout)

	// Register handlers
	NewFileStorageHandler(e, fileStorageUseCase)
	NewAutoUploadHandler(e, autoUploadUseCase)
}
