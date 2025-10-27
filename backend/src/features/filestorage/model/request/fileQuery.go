package request

// FileQueryRequest represents a request to list files
type FileQueryRequest struct {
	ProjectID string            `json:"project_id" validate:"required"`
	Category  string            `json:"category" validate:"required"`
	Filters   map[string]string `json:"filters"`   // Optional filters (e.g., cctv_id)
	Page      int               `json:"page"`      // Page number (default: 1)
	PageSize  int               `json:"page_size"` // Items per page (default: 100)
}
