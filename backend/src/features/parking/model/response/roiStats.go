package response

type ResRoiStats struct {
	Folders []FolderInfo `json:"folders"`
	Total   int          `json:"total"`
}
