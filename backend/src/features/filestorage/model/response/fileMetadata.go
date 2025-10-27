package response

import "main/features/filestorage/model/entity"

// ResFileMetadata represents the response for file metadata
type ResFileMetadata struct {
	File entity.FileInfo `json:"file"`
}
