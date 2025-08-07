package response

type ResRoiUpload struct {
	TotalFiles int `json:"total_files"`
	Success    int `json:"success"`
	Failed     int `json:"failed"`
}
