package response

type ResLearningResults struct {
	Success bool                `json:"success"`
	Message string              `json:"message"`
	Data    LearningResultsData `json:"data"`
}

type LearningResultsData struct {
	Timestamp string           `json:"timestamp"`
	CctvList  []CctvResultInfo `json:"cctv_list"`
}

type CctvResultInfo struct {
	CctvID    string `json:"cctv_id"`
	HasImages bool   `json:"has_images"`
}
