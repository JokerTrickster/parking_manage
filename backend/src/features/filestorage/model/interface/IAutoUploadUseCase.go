package _interface

import (
	"context"
	"mime/multipart"
)

// IAutoUploadUseCase defines the interface for auto-upload business logic
type IAutoUploadUseCase interface {
	// AutoUpload handles async upload with versioning
	AutoUpload(ctx context.Context, projectID string, fileHeader *multipart.FileHeader) error
}
