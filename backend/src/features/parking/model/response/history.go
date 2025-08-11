package response

type ResHistory struct {
	Results []HistoryItem `json:"results"`
}

type HistoryItem struct {
	Id         int      `json:"id"`
	Name       string   `json:"name"`
	CreatedAt  string   `json:"created_at"`
	FolderPath string   `json:"folder_path"`
	CctvList   []string `json:"cctv_list"`
}
