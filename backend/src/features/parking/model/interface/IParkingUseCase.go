package _interface

import (
	"context"
	"main/features/parking/model/response"
	"mime/multipart"
)

type ILearningUploadParkingUseCase interface {
	LearningUpload(c context.Context, projectID string, files []*multipart.FileHeader) (response.ResLearningUpload, error)
}

type ITestUploadParkingUseCase interface {
	TestUpload(c context.Context, projectID string, files []*multipart.FileHeader) (response.ResTestUpload, error)
}

type IRoiUploadParkingUseCase interface {
	RoiUpload(c context.Context, projectID string, files []*multipart.FileHeader) (response.ResRoiUpload, error)
}

type ILearningStatsParkingUseCase interface {
	GetLearningStats(c context.Context, projectID string) (response.ResLearningStats, error)
}

type ITestStatsParkingUseCase interface {
	GetTestStats(c context.Context, projectID string) (response.ResTestStats, error)
}

type IRoiStatsParkingUseCase interface {
	GetRoiStats(c context.Context, projectID string) (response.ResRoiStats, error)
}
