package response

import "main/features/filestorage/model/entity"

// ResUpload represents the response for file upload
type ResUpload struct {
	TotalFiles    int               `json:"total_files"`
	SuccessCount  int               `json:"success_count"`
	FailedCount   int               `json:"failed_count"`
	Version       string            `json:"version,omitempty"`       // Version timestamp for versioned files
	UploadedFiles []entity.FileInfo `json:"uploaded_files"`          // List of successfully uploaded files
	Errors        []string          `json:"errors,omitempty"`        // Error messages for failed files
}
