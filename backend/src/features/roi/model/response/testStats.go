package response

type ResTestStatsRoi struct {
	Images []ImageInfo `json:"images"`
	Total  int         `json:"total"`
}

type ImageInfo struct {
	Name string `json:"name"`
	Path string `json:"path"`
}
