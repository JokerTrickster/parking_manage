package response

type ResImage struct {
	Success     bool   `json:"success"`
	Message     string `json:"message"`
	Data        []byte `json:"data"`
	ContentType string `json:"content_type"`
}
