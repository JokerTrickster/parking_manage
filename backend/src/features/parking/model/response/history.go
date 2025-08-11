package response

type ResHistory struct {
	Results []HistoryItem `json:"results"`
}

type HistoryItem struct {
	Id           int      `json:"id"`
	Name         string   `json:"name"`
	CreatedAt    string   `json:"created_at"`
	FolderPath   string   `json:"folder_path"`
	Epoch        int      `json:"epoch"`
	LearningRate float64  `json:"learning_rate"`
	VarThreshold float64  `json:"var_threshold"`
	CctvList     []string `json:"cctv_list"`
}
