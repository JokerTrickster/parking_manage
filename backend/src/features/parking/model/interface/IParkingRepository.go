package _interface

import (
	"context"
	"main/common/db/mysql"
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
	CreateExperimentSession(ctx context.Context, experimentSession mysql.ExperimentSession) (int, error)
	CreateCctvResult(ctx context.Context, cctvResult mysql.CctvResult) (int, error)
	CreateRoiResult(ctx context.Context, roiResult mysql.RoiResult) error
}
