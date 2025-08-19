package request

type ReqLiveLearning struct {
	ProjectID    string  `json:"projectId"`
	LearningRate float64 `json:"learningRate"`
	Iterations   int     `json:"iterations"`
	VarThreshold float64 `json:"varThreshold"`
	LearningPath string  `json:"learningPath"`
	RoiPath      string  `json:"roiPath"`
}
