package entity

import "time"

// FileInfo represents information about a stored file
type FileInfo struct {
	Filename     string    `json:"filename"`      // Actual filename on disk (may be versioned)
	OriginalName string    `json:"original_name"` // Original filename without version
	Version      string    `json:"version"`       // Version timestamp (empty for non-versioned)
	SizeBytes    int64     `json:"size_bytes"`    // File size in bytes
	UploadDate   time.Time `json:"upload_date"`   // When file was uploaded
	FileType     string    `json:"file_type"`     // MIME type
	Path         string    `json:"path"`          // Full path on filesystem
	CctvID       string    `json:"cctv_id"`       // CCTV ID for learning/test images (optional)
}
