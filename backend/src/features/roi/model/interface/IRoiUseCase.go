package _interface

import (
	"context"
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
