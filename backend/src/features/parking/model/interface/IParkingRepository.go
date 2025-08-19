package _interface

import (
	"context"
	"main/common/db/mysql"
	"main/features/parking/model/response"
)

type ILearningUploadParkingRepository interface {
}

type ITestUploadParkingRepository interface {
}

type IRoiUploadParkingRepository interface {
}

type ILearningStatsParkingRepository interface {
}

type ITestStatsParkingRepository interface {
}

type IRoiStatsParkingRepository interface {
}

type ILearningParkingRepository interface {
	CreateExperimentSession(ctx context.Context, experimentSession mysql.ExperimentSessions) (int, error)
	CreateCctvResult(ctx context.Context, cctvResult mysql.CctvResults) (int, error)
	CreateRoiResult(ctx context.Context, roiResult mysql.RoiResults) error
}

type ILearningResultsParkingRepository interface {
	GetLearningResults(ctx context.Context, projectID string, timestamp string) (response.ResLearningResults, error)
}

type ICctvImagesParkingRepository interface {
	GetCctvImages(ctx context.Context, projectID string, timestamp string, cctvID string) (response.ResCctvImages, error)
}

type IImageParkingRepository interface {
}

type IHistoryParkingRepository interface {
	GetHistory(ctx context.Context, projectID string) ([]mysql.ExperimentSessions, error)
	FindCctvResultByExperimentSessionID(ctx context.Context, experimentSessionID int) ([]string, error)
}

type ILabelGetParkingRepository interface {
}

type ILabelSaveParkingRepository interface {
}

type IDeleteFileParkingRepository interface {
}

type IBatchImagesParkingRepository interface {
}
