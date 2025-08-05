package _interface

import "context"

type ILearningUploadParkingUseCase interface {
	LearningUpload(c context.Context) error
}
