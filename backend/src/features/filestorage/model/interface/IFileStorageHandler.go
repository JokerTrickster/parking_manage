package _interface

import "github.com/labstack/echo/v4"

// IFileStorageHandler defines the interface for file storage HTTP handlers
type IFileStorageHandler interface {
	// Upload handles file upload requests
	Upload(c echo.Context) error

	// List handles file listing requests
	List(c echo.Context) error

	// Download handles file download requests
	Download(c echo.Context) error

	// DownloadLatest handles downloading the latest version
	DownloadLatest(c echo.Context) error
}
