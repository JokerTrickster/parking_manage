package response

type ResGetLabel struct {
	Labels []GetLabelData `json:"labels"`
}

type GetLabelData struct {
	RoiId      string `json:"roi_id"`
	HasVehicle bool   `json:"has_vehicle"`
}
