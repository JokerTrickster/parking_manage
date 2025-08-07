package response

type ResLearningStats struct {
	Folders []FolderInfo `json:"folders"`
	Total   int          `json:"total"`
}
