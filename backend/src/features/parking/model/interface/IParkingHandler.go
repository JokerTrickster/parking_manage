package _interface

import "github.com/labstack/echo/v4"

type ILearningUploadParkingHandler interface {
	LearningUpload(c echo.Context) error
}

type ITestUploadParkingHandler interface {
	TestUpload(c echo.Context) error
}

type IRoiUploadParkingHandler interface {
	RoiUpload(c echo.Context) error
}

type ILearningStatsParkingHandler interface {
	GetLearningStats(c echo.Context) error
}

type ITestStatsParkingHandler interface {
	GetTestStats(c echo.Context) error
}

type IRoiStatsParkingHandler interface {
	GetRoiStats(c echo.Context) error
}
