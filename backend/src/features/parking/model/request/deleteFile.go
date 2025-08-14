package request

type ReqDeleteFile struct {
	DeleteName string `json:"deleteName" validate:"required"`
}
