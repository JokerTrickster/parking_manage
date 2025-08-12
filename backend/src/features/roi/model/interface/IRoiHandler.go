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
