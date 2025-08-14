package response

type ResDeleteFile struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
