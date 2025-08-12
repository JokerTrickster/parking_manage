package _interface

import "github.com/labstack/echo/v4"

type IUploadRoiHandler interface {
	UploadRoi(c echo.Context) error
}

type ITestStatsRoiHandler interface {
	GetTestStats(c echo.Context) error
}

type ICreateDraftRoiHandler interface {
	CreateDraftRoi(c echo.Context) error
}

type IGetDraftRoiHandler interface {
	GetDraftRoi(c echo.Context) error
}

type ISaveDraftRoiHandler interface {
	SaveDraftRoi(c echo.Context) error
}

// ROI CRUD Handler 인터페이스들
type ICreateRoiHandler interface {
	CreateRoi(c echo.Context) error
}

type IReadRoiHandler interface {
	ReadRoi(c echo.Context) error
}

type IUpdateRoiHandler interface {
	UpdateRoi(c echo.Context) error
}

type IDeleteRoiHandler interface {
	DeleteRoi(c echo.Context) error
}
