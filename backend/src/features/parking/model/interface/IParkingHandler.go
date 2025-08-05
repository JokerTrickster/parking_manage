package _interface

import "github.com/labstack/echo/v4"

type ILearningUploadParkingHandler interface {
	LearningUpload(c echo.Context) error
}
