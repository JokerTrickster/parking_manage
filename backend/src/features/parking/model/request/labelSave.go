package request

type ReqLabelSave struct {
	Labels []LabelData `json:"labels"`
}

type LabelData struct {
	RoiId      string `json:"roi_id"`
	HasVehicle bool   `json:"has_vehicle"`
}
