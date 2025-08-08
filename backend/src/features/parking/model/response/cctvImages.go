package response

type ResCctvImages struct {
	Success bool           `json:"success"`
	Message string         `json:"message"`
	Data    CctvImagesData `json:"data"`
}

type CctvImagesData struct {
	CctvID         string `json:"cctv_id"`
	RoiResultImage string `json:"roi_result_image"`
	FgMaskImage    string `json:"fg_mask_image"`
}
