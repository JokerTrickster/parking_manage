package response

type ResDraftRoi struct {
	CctvList []CctvRoiInfo `json:"cctv_list"`
}

type CctvRoiInfo struct {
	CctvID    string        `json:"cctv_id"`
	ParkingID string        `json:"parking_id"`
	RoiCoords []interface{} `json:"roi_coords"`
}

type ResSaveDraft struct {
	Success  bool   `json:"success"`
	Message  string `json:"message"`
	FileName string `json:"file_name"`
}

// ROI CRUD 응답 모델들
type ResCreateRoi struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type ResReadRoi struct {
	CctvID string                   `json:"cctv_id"`
	Rois   map[string][]interface{} `json:"rois"`
}

type ResUpdateRoi struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type ResDeleteRoi struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
