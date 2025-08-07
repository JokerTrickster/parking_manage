package response

type ResTestStats struct {
	Folders []FolderInfo `json:"folders"`
	Total   int          `json:"total"`
}
