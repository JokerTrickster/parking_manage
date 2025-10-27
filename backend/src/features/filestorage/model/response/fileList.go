package response

import "main/features/filestorage/model/entity"

// ResFileList represents the response for file listing
type ResFileList struct {
	TotalCount int               `json:"total_count"`
	Files      []entity.FileInfo `json:"files"`
	Pagination Pagination        `json:"pagination"`
}

// Pagination represents pagination information
type Pagination struct {
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
	TotalPages int `json:"total_pages"`
}
