package entity

type RoiResult struct {
	ForegroundRatio float64 `json:"foreground_ratio"`
	RoiID           int     `json:"roi_id"`
}
type CctvResult struct {
	CctvID           string      `json:"cctv_id"`
	LearningDataSize int         `json:"learning_data_size"`
	RoiResults       []RoiResult `json:"roi_results"`
}

type ExperimentResult struct {
	ProjectID  string       `json:"project_id"`
	Results    []CctvResult `json:"results"`
	TotalTests int          `json:"total_tests"`
}
