package response

type ResSaveLabel struct {
	Labels []SaveLabelData `json:"labels"`
}

type SaveLabelData struct {
	RoiId      string `json:"roi_id"`
	HasVehicle bool   `json:"has_vehicle"`
}
