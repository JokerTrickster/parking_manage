package request

type ReqLearning struct {
	ProjectID    string  `json:"projectId"`
	LearningRate float64 `json:"learningRate"`
	Iterations   int     `json:"iterations"`
	VarThreshold float64 `json:"varThreshold"`
	LearningPath string  `json:"learningPath"`
	TestPath     string  `json:"testPath"`
	RoiPath      string  `json:"roiPath"`
}
