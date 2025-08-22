package response

type ResCctvImage struct {
	Success     bool   `json:"success"`
	Message     string `json:"message"`
	CctvID      string `json:"cctv_id"`
	Image       []byte `json:"image"`
	ContentType string `json:"content_type"`
}
