package _interface

import (
	"context"
	"main/features/parking/model/request"
	"main/features/parking/model/response"
	"mime/multipart"
)

type ILearningUploadParkingUseCase interface {
	LearningUpload(ctx context.Context, projectID string, files []*multipart.FileHeader) (response.ResLearningUpload, error)
}

type ITestUploadParkingUseCase interface {
	TestUpload(ctx context.Context, projectID string, files []*multipart.FileHeader) (response.ResTestUpload, error)
}

type IRoiUploadParkingUseCase interface {
	RoiUpload(ctx context.Context, projectID string, files []*multipart.FileHeader) (response.ResRoiUpload, error)
}

type ILearningStatsParkingUseCase interface {
	GetLearningStats(ctx context.Context, projectID string) (response.ResLearningStats, error)
}

type ITestStatsParkingUseCase interface {
	GetTestStats(ctx context.Context, projectID string) (response.ResTestStats, error)
}

type IRoiStatsParkingUseCase interface {
	GetRoiStats(ctx context.Context, projectID string) (response.ResRoiStats, error)
}

type ILearningParkingUseCase interface {
	Learning(ctx context.Context, req request.ReqLearning) (response.ResLearning, error)
}

type ILearningResultsParkingUseCase interface {
	GetLearningResults(ctx context.Context, projectID string, timestamp string) (response.ResLearningResults, error)
}

type ICctvImagesParkingUseCase interface {
	GetCctvImages(ctx context.Context, projectID string, timestamp string, cctvID string) (response.ResCctvImages, error)
}

type IResultLearningParkingUseCase interface {
	ResultLearning(c context.Context) error
}
