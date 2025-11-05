package usecase

import (
	"context"
	"fmt"
	"log"
	"mime/multipart"
	"time"

	_interface "main/features/filestorage/model/interface"
	"main/features/filestorage/util"
)

type AutoUploadUseCase struct {
	Repository     _interface.IFileStorageRepository
	ContextTimeout time.Duration
}

func NewAutoUploadUseCase(repo _interface.IFileStorageRepository, timeout time.Duration) _interface.IAutoUploadUseCase {
	return &AutoUploadUseCase{
		Repository:     repo,
		ContextTimeout: timeout,
	}
}

// AutoUpload handles async upload with versioning
func (u *AutoUploadUseCase) AutoUpload(ctx context.Context, projectID string, fileHeader *multipart.FileHeader) error {
	ctx, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	// Open file
	file, err := fileHeader.Open()
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Generate versioned filename
	versionedName := util.GenerateVersionedFilename(fileHeader.Filename)

	// Save file with versioning (category is always "map" for map editor)
	savedFilename, err := u.Repository.SaveFile(projectID, "map", versionedName, file)
	if err != nil {
		return fmt.Errorf("failed to save file: %w", err)
	}

	// Log success
	log.Printf("[AUTO-UPLOAD] SUCCESS: project=%s, file=%s -> %s", projectID, fileHeader.Filename, savedFilename)

	return nil
}
