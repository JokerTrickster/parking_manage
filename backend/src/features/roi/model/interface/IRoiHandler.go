package _interface

import "github.com/labstack/echo/v4"

type IUploadRoiHandler interface {
	UploadRoi(c echo.Context) error
}

type ITestStatsRoiHandler interface {
	GetTestStats(c echo.Context) error
}

type IDraftRoiHandler interface {
	CreateDraftRoi(c echo.Context) error
}
