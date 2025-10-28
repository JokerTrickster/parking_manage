package _interface

import (
	"io"
	"mime/multipart"

	"main/common/db/mysql"
	"main/features/filestorage/model/entity"
)

// IFileStorageRepository defines the interface for file storage operations
type IFileStorageRepository interface {
	// SaveFile saves a file to the filesystem
	SaveFile(projectID, category, filename string, file multipart.File) error

	// SaveFileHistory saves file upload history to database
	SaveFileHistory(history *mysql.FileStorageHistory) error

	// ListFiles returns all files for a project category with optional filters
	ListFiles(projectID, category string, filters map[string]string) ([]entity.FileInfo, error)

	// ReadFile returns file content as io.ReadCloser
	ReadFile(projectID, category, filename string) (io.ReadCloser, error)

	// DeleteFile removes a file from the filesystem
	DeleteFile(projectID, category, filename string) error

	// GetFileMetadata returns file information
	GetFileMetadata(projectID, category, filename string) (entity.FileInfo, error)

	// FileExists checks if a file exists
	FileExists(projectID, category, filename string) bool
}
