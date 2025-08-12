package request

type CreateRoiRequest struct {
	RoiID   string `json:"roi_id"`
	CctvID  string `json:"cctv_id"`
	RoiFile string `json:"roi_file"`
	Coords  []int  `json:"coords"`
}

type ReadRoiRequest struct {
	CctvID  string `json:"cctv_id"`
	RoiFile string `json:"roi_file"`
}

type UpdateRoiRequest struct {
	RoiID   string `json:"roi_id"`
	CctvID  string `json:"cctv_id"`
	RoiFile string `json:"roi_file"`
	Coords  []int  `json:"coords"`
}

type DeleteRoiRequest struct {
	RoiID   string `json:"roi_id"`
	CctvID  string `json:"cctv_id"`
	RoiFile string `json:"roi_file"`
}
