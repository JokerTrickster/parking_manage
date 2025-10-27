package _interface

import (
	"context"
	"io"

	"main/features/filestorage/model/entity"
	"main/features/filestorage/model/request"
	"main/features/filestorage/model/response"
)

// IFileStorageUseCase defines the interface for file storage business logic
type IFileStorageUseCase interface {
	// UploadFile handles file upload with optional versioning
	UploadFile(ctx context.Context, req request.UploadRequest) (response.ResUpload, error)

	// ListFiles returns file list with metadata
	ListFiles(ctx context.Context, req request.FileQueryRequest) (response.ResFileList, error)

	// DownloadFile retrieves file for download
	DownloadFile(ctx context.Context, projectID, category, filename string) (io.ReadCloser, entity.FileInfo, error)

	// GetLatestVersion returns the most recent version of a file
	GetLatestVersion(ctx context.Context, projectID, category, originalName string) (string, error)
}
