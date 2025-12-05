package request

import "mime/multipart"

// UploadRequest represents a file upload request
type UploadRequest struct {
	ProjectID  string                  `json:"project_id" validate:"required"`
	Category   string                  `json:"category" validate:"required"`
	Files      []*multipart.FileHeader `json:"files" validate:"required"`
	FolderPath string                  `json:"folder_path"` // Optional: specify target folder path
}
