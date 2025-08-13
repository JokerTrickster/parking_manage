package _interface

import (
	"context"
	"main/features/roi/model/request"
	"main/features/roi/model/response"
	"mime/multipart"
)

type IUploadRoiUseCase interface {
	UploadRoi(ctx context.Context, projectID string, files []*multipart.FileHeader) (response.ResUpload, error)
}

type ITestStatsRoiUseCase interface {
	GetTestStats(ctx context.Context, projectID string, folderPath string) (response.ResTestStatsRoi, error)
}

type ICreateDraftRoiUseCase interface {
	CreateDraftRoi(ctx context.Context, projectID string, originFile string) error
}

type IGetDraftRoiUseCase interface {
	GetDraftRoi(ctx context.Context, projectID string, roiFileName string) (response.ResDraftRoi, error)
}

type ISaveDraftRoiUseCase interface {
	SaveDraftRoi(ctx context.Context, projectID string, roiFileName string) (response.ResSaveDraft, error)
}

// ROI CRUD UseCase 인터페이스들
type ICreateRoiUseCase interface {
	CreateRoi(ctx context.Context, projectID string, req request.CreateRoiRequest) (response.ResCreateRoi, error)
}

type IReadRoiUseCase interface {
	ReadRoi(ctx context.Context, projectID string, req request.ReadRoiRequest) (response.ResReadRoi, error)
}

type IUpdateRoiUseCase interface {
	UpdateRoi(ctx context.Context, projectID string, req request.UpdateRoiRequest) (response.ResUpdateRoi, error)
}

type IDeleteRoiUseCase interface {
	DeleteRoi(ctx context.Context, projectID string, req request.DeleteRoiRequest) (response.ResDeleteRoi, error)
}

type IGetImageRoiUseCase interface {
	GetImageRoi(ctx context.Context, projectID string, folderPath string, fileName string) (response.ResGetImageRoi, error)
}
