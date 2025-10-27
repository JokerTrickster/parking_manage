package handler

import (
	"context"
	"log"
	"net/http"
	"strings"

	"main/common"
	_interface "main/features/filestorage/model/interface"

	"github.com/labstack/echo/v4"
)

type AutoUploadHandler struct {
	UseCase _interface.IAutoUploadUseCase
}

// NewAutoUploadHandler creates a new auto-upload handler and registers route
func NewAutoUploadHandler(e *echo.Echo, useCase _interface.IAutoUploadUseCase) _interface.IAutoUploadHandler {
	handler := &AutoUploadHandler{
		UseCase: useCase,
	}

	// Auto-upload endpoint for map editor
	e.POST("/v0.1/filestorage/:projectId/map/auto-upload", handler.AutoUpload)

	return handler
}

// AutoUpload handles async file upload from map editor
// @Router /v0.1/filestorage/{projectId}/map/auto-upload [post]
// @Summary Auto-upload map JSON from map editor
// @Description Asynchronously uploads map JSON file when user exports from map editor. Returns immediately (fire-and-forget).
// @Tags File Storage
// @Accept multipart/form-data
// @Produce json
// @Param projectId path string true "Project ID (e.g., banpo, osong)"
// @Param file formData file true "Map JSON file"
// @Success 202 {object} map[string]interface{} "Upload initiated"
// @Failure 400 {object} map[string]interface{} "Bad request"
func (h *AutoUploadHandler) AutoUpload(c echo.Context) error {
	_, _, _ = common.CtxGenerate(c)

	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	// Parse multipart form
	form, err := c.MultipartForm()
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "failed to parse form data",
		})
	}

	// Get file
	files := form.File["file"]
	if len(files) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "no file provided",
		})
	}

	file := files[0]

	// Validate file type (log warning but continue - no validation per PRD)
	if !strings.HasSuffix(file.Filename, ".json") {
		log.Printf("[AUTO-UPLOAD] WARNING: Non-JSON file uploaded: %s", file.Filename)
	}

	// Launch async upload (fire-and-forget)
	go func() {
		// Use background context to avoid cancellation when request ends
		bgCtx := context.Background()

		if err := h.UseCase.AutoUpload(bgCtx, projectID, file); err != nil {
			// Log error but don't propagate to client
			log.Printf("[AUTO-UPLOAD] ERROR: project=%s, file=%s, error=%v", projectID, file.Filename, err)
		}
	}()

	// Return immediate success response (202 Accepted)
	return c.JSON(http.StatusAccepted, map[string]interface{}{
		"success": true,
		"message": "upload initiated",
		"data": map[string]string{
			"project_id": projectID,
			"filename":   file.Filename,
		},
	})
}
