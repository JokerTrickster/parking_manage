package entity

type LabelData struct {
	RoiId      string `json:"roi_id"`
	HasVehicle bool   `json:"has_vehicle"`
}

type ImageLabel struct {
	ImageId  string      `json:"image_id"`
	ImageUrl string      `json:"image_url"`
	Labels   []LabelData `json:"labels"`
}
