package response

type FolderInfo struct {
	Name      string `json:"name"`
	Path      string `json:"path"`
	FileCount int    `json:"fileCount"`
}

type ResLearningStats struct {
	Folders []FolderInfo `json:"folders"`
	Total   int          `json:"total"`
}

type ResTestStats struct {
	Folders []FolderInfo `json:"folders"`
	Total   int          `json:"total"`
}
