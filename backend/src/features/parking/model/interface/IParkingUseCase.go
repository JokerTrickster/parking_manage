package _interface

import (
	"context"
	"main/features/parking/model/response"
	"mime/multipart"
)

type ILearningUploadParkingUseCase interface {
	LearningUpload(c context.Context, projectID string, files []*multipart.FileHeader) (response.ResLearningUpload, error)
}
