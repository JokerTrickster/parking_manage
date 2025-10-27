package _interface

import "github.com/labstack/echo/v4"

// IAutoUploadHandler defines the interface for auto-upload HTTP handler
type IAutoUploadHandler interface {
	// AutoUpload handles async file upload from map editor
	AutoUpload(c echo.Context) error
}
