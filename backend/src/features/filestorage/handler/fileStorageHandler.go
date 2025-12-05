package handler

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"main/common"
	"main/features/filestorage/model/entity"
	_interface "main/features/filestorage/model/interface"
	"main/features/filestorage/model/request"
	_ "main/features/filestorage/model/response" // imported for Swagger

	"github.com/labstack/echo/v4"
)

type FileStorageHandler struct {
	UseCase _interface.IFileStorageUseCase
}

// NewFileStorageHandler creates a new file storage handler and registers routes
func NewFileStorageHandler(e *echo.Echo, useCase _interface.IFileStorageUseCase) _interface.IFileStorageHandler {
	handler := &FileStorageHandler{
		UseCase: useCase,
	}

	// Upload endpoints
	e.POST("/v0.1/filestorage/:projectId/map/upload", handler.Upload)
	e.POST("/v0.1/filestorage/:projectId/cad/upload", handler.Upload)
	e.POST("/v0.1/filestorage/:projectId/roi/upload", handler.Upload)
	e.POST("/v0.1/filestorage/:projectId/learning/upload", handler.Upload)
	e.POST("/v0.1/filestorage/:projectId/test/upload", handler.Upload)

	// List endpoints
	e.GET("/v0.1/filestorage/:projectId/map/list", handler.List)
	e.GET("/v0.1/filestorage/:projectId/cad/list", handler.List)
	e.GET("/v0.1/filestorage/:projectId/roi/list", handler.List)
	e.GET("/v0.1/filestorage/:projectId/learning/list", handler.List)
	e.GET("/v0.1/filestorage/:projectId/test/list", handler.List)

	// Download endpoints
	e.GET("/v0.1/filestorage/:projectId/:category/download/*", handler.Download)
	e.GET("/v0.1/filestorage/:projectId/:category/latest", handler.DownloadLatest)

	// Delete endpoint
	e.DELETE("/v0.1/filestorage/:projectId/:category/delete/*", handler.Delete)

	// Batch delete endpoint
	e.POST("/v0.1/filestorage/:projectId/:category/batch-delete", handler.BatchDelete)

	// Folder delete endpoint
	e.DELETE("/v0.1/filestorage/:projectId/:category/folder/*", handler.DeleteFolder)

	// Folder structure endpoints (roi/learning/test)
	e.GET("/v0.1/filestorage/:projectId/roi/folders", handler.ListFolders)
	e.GET("/v0.1/filestorage/:projectId/learning/folders", handler.ListFolders)
	e.GET("/v0.1/filestorage/:projectId/test/folders", handler.ListFolders)

	return handler
}

// Upload handles file upload requests
// @Router /v0.1/filestorage/{projectId}/{category}/upload [post]
// @Summary Upload files with optional versioning
// @Description Upload files to specified category. Map/CAD/ROI files are automatically versioned with timestamp suffix. Use folder_path query parameter to specify upload location.
// @Tags File Storage
// @Accept multipart/form-data
// @Produce json
// @Param projectId path string true "Project ID (e.g., banpo, osong)"
// @Param category path string true "Category (map, cad, roi, learning, test)"
// @Param folder_path query string false "Target folder path (e.g., 2025-01-01/P1_B2_3)"
// @Param files formData file true "Files to upload (single or multiple)"
// @Success 200 {object} response.ResUpload "Upload successful"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 500 {object} map[string]interface{} "Internal server error"
func (h *FileStorageHandler) Upload(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	// Get parameters
	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	// Extract category from path
	category := extractCategoryFromPath(c.Path())
	if category == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "category is required",
		})
	}

	// Validate category
	cat := entity.FileCategory(category)
	if !cat.IsValid() {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("invalid category: %s", category),
		})
	}

	// Parse multipart form with 2GB memory limit (matches BodyLimit middleware)
	// This sets the max memory for parsing multipart form data
	c.Request().ParseMultipartForm(2 << 30) // 2GB

	form, err := c.MultipartForm()
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "failed to parse multipart form: " + err.Error(),
		})
	}

	// Get files
	files := form.File["files"]
	if len(files) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "no files provided",
		})
	}

	// Get optional folder_path parameter
	folderPath := c.QueryParam("folder_path")

	// Create upload request
	uploadReq := request.UploadRequest{
		ProjectID:  projectID,
		Category:   category,
		Files:      files,
		FolderPath: folderPath,
	}

	// Upload files
	res, err := h.UseCase.UploadFile(ctx, uploadReq)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "upload failed: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "files uploaded successfully",
		"data":    res,
	})
}

// List handles file listing requests
// @Router /v0.1/filestorage/{projectId}/{category}/list [get]
// @Summary List files in a category
// @Description Returns list of files with metadata. Supports pagination and CCTV ID filtering for learning/test categories.
// @Tags File Storage
// @Produce json
// @Param projectId path string true "Project ID"
// @Param category path string true "Category (map, cad, roi, learning, test)"
// @Param cctv_id query string false "Filter by CCTV ID (for learning/test only)"
// @Param page query int false "Page number (default: 1)"
// @Param page_size query int false "Items per page (default: 100)"
// @Success 200 {object} response.ResFileList "File list retrieved"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 500 {object} map[string]interface{} "Internal server error"
func (h *FileStorageHandler) List(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	// Get parameters
	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	// Extract category from path
	category := extractCategoryFromPath(c.Path())
	if category == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "category is required",
		})
	}

	// Validate category
	cat := entity.FileCategory(category)
	if !cat.IsValid() {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("invalid category: %s", category),
		})
	}

	// Get query parameters
	cctvID := c.QueryParam("cctv_id")
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	// Build filters
	filters := make(map[string]string)
	if cctvID != "" {
		filters["cctv_id"] = cctvID
	}

	// Create query request
	queryReq := request.FileQueryRequest{
		ProjectID: projectID,
		Category:  category,
		Filters:   filters,
		Page:      page,
		PageSize:  pageSize,
	}

	// Get file list
	res, err := h.UseCase.ListFiles(ctx, queryReq)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "failed to list files: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "files retrieved successfully",
		"data":    res,
	})
}

// Download handles file download requests
// @Router /v0.1/filestorage/{projectId}/{category}/download/{filename} [get]
// @Summary Download a file
// @Description Downloads the specified file with streaming support. Supports nested folder paths.
// @Tags File Storage
// @Produce application/octet-stream
// @Param projectId path string true "Project ID"
// @Param category path string true "Category"
// @Param filename path string true "Filename to download (can include folder path, e.g., folder1/image.jpg)"
// @Success 200 {file} binary "File content"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 404 {object} map[string]interface{} "File not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
func (h *FileStorageHandler) Download(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	// Get parameters
	projectID := c.Param("projectId")
	category := c.Param("category")

	// Extract filename from wildcard parameter (supports nested paths like "folder1/image.jpg")
	filename := c.Param("*")

	// URL decode the filename (handles spaces and special characters)
	decodedFilename, decodeErr := url.QueryUnescape(filename)
	if decodeErr != nil {
		decodedFilename = filename // fallback to original if decode fails
	}
	filename = decodedFilename

	if projectID == "" || category == "" || filename == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId, category, and filename are required",
		})
	}

	// Validate category
	cat := entity.FileCategory(category)
	if !cat.IsValid() {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("invalid category: %s", category),
		})
	}

	// Download file
	fileReader, fileInfo, err := h.UseCase.DownloadFile(ctx, projectID, category, filename)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "file not found: " + err.Error(),
		})
	}
	defer fileReader.Close()

	// Set response headers
	c.Response().Header().Set("Content-Type", fileInfo.FileType)
	c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", fileInfo.Filename))
	c.Response().Header().Set("Content-Length", strconv.FormatInt(fileInfo.SizeBytes, 10))

	// Stream file
	return c.Stream(http.StatusOK, fileInfo.FileType, fileReader)
}

// DownloadLatest handles downloading the latest version
// @Router /v0.1/filestorage/{projectId}/{category}/latest [get]
// @Summary Download latest version of a file
// @Description Downloads the most recent version of a versioned file (map/cad/roi only). For JSON files, returns parsed JSON instead of file stream.
// @Tags File Storage
// @Produce application/octet-stream
// @Param projectId path string true "Project ID"
// @Param category path string true "Category (map, cad, or roi)"
// @Param original_name query string true "Original filename without version"
// @Success 200 {file} binary "File content or parsed JSON"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 404 {object} map[string]interface{} "File not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
func (h *FileStorageHandler) DownloadLatest(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	// Get parameters
	projectID := c.Param("projectId")
	category := c.Param("category")
	originalName := c.QueryParam("original_name")

	if projectID == "" || category == "" || originalName == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId, category, and original_name are required",
		})
	}

	// Validate category
	cat := entity.FileCategory(category)
	if !cat.IsValid() {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("invalid category: %s", category),
		})
	}

	if !cat.IsVersioned() {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("category %s does not support versioning", category),
		})
	}

	// Get latest version filename
	latestFilename, err := h.UseCase.GetLatestVersion(ctx, projectID, category, originalName)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "latest version not found: " + err.Error(),
		})
	}

	// Download latest version
	fileReader, fileInfo, err := h.UseCase.DownloadFile(ctx, projectID, category, latestFilename)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "file not found: " + err.Error(),
		})
	}
	defer fileReader.Close()

	// Check if JSON file and parse it
	if strings.HasSuffix(strings.ToLower(fileInfo.Filename), ".json") {
		// Read file content
		data, err := io.ReadAll(fileReader)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"success": false,
				"message": "failed to read JSON file: " + err.Error(),
			})
		}

		// Return raw JSON data with proper content type
		c.Response().Header().Set("Content-Type", "application/json")
		return c.String(http.StatusOK, string(data))
	}

	// For non-JSON files, stream as before
	c.Response().Header().Set("Content-Type", fileInfo.FileType)
	c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", fileInfo.Filename))
	c.Response().Header().Set("Content-Length", strconv.FormatInt(fileInfo.SizeBytes, 10))

	// Stream file
	return c.Stream(http.StatusOK, fileInfo.FileType, fileReader)
}

// ListFolders handles folder structure listing requests (roi/learning/test)
// @Router /v0.1/filestorage/{projectId}/{category}/folders [get]
// @Summary List folder structure
// @Description Returns folder tree structure for roi/learning/test categories
// @Tags File Storage
// @Produce json
// @Param projectId path string true "Project ID"
// @Param category path string true "Category (roi, learning or test)"
// @Success 200 {object} map[string]interface{} "Folder structure"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 500 {object} map[string]interface{} "Internal server error"
func (h *FileStorageHandler) ListFolders(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	// Get parameters
	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	// Extract category from path
	category := extractCategoryFromPath(c.Path())
	if category == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "category is required",
		})
	}

	// Validate category (roi/learning/test supported)
	if category != "roi" && category != "learning" && category != "test" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "folder listing only supported for roi/learning/test categories",
		})
	}

	// Get current path from query parameter (for nested folders)
	currentPath := c.QueryParam("path")

	// Get folder structure
	folders, err := h.UseCase.ListFolders(ctx, projectID, category, currentPath)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "failed to list folders: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "folders retrieved successfully",
		"data":    folders,
	})
}

// Delete handles file deletion requests
// @Router /v0.1/filestorage/{projectId}/{category}/delete/{filename} [delete]
// @Summary Delete a file
// @Description Deletes the specified file. Supports nested folder paths.
// @Tags File Storage
// @Produce json
// @Param projectId path string true "Project ID"
// @Param category path string true "Category"
// @Param filename path string true "Filename to delete (can include folder path, e.g., folder1/image.jpg)"
// @Success 200 {object} map[string]interface{} "File deleted successfully"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 404 {object} map[string]interface{} "File not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
func (h *FileStorageHandler) Delete(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	// Get parameters
	projectID := c.Param("projectId")
	category := c.Param("category")

	// Extract filename from wildcard parameter (supports nested paths like "folder1/image.jpg")
	filename := c.Param("*")

	// URL decode the filename (handles spaces and special characters)
	decodedFilename, decodeErr := url.QueryUnescape(filename)
	if decodeErr != nil {
		decodedFilename = filename // fallback to original if decode fails
	}
	filename = decodedFilename

	if projectID == "" || category == "" || filename == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId, category, and filename are required",
		})
	}

	// Validate category
	cat := entity.FileCategory(category)
	if !cat.IsValid() {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("invalid category: %s", category),
		})
	}

	// Delete file
	err := h.UseCase.DeleteFile(ctx, projectID, category, filename)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "failed to delete file: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "file deleted successfully",
	})
}

// BatchDelete handles batch file deletion requests
// @Router /v0.1/filestorage/{projectId}/{category}/batch-delete [post]
// @Summary Delete multiple files
// @Description Deletes multiple files in a single request
// @Tags File Storage
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Param category path string true "Category"
// @Param filenames body []string true "Array of filenames to delete"
// @Success 200 {object} map[string]interface{} "Files deleted successfully"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 500 {object} map[string]interface{} "Internal server error"
func (h *FileStorageHandler) BatchDelete(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	// Get parameters
	projectID := c.Param("projectId")
	category := c.Param("category")

	if projectID == "" || category == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId and category are required",
		})
	}

	// Validate category
	cat := entity.FileCategory(category)
	if !cat.IsValid() {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("invalid category: %s", category),
		})
	}

	// Parse request body
	var req struct {
		Filenames []string `json:"filenames"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "invalid request body: " + err.Error(),
		})
	}

	if len(req.Filenames) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "filenames array is required and cannot be empty",
		})
	}

	// Delete files
	err := h.UseCase.DeleteFiles(ctx, projectID, category, req.Filenames)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "failed to delete files: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("%d files deleted successfully", len(req.Filenames)),
	})
}

// DeleteFolder handles folder deletion requests
// @Router /v0.1/filestorage/{projectId}/{category}/folder/{folderPath} [delete]
// @Summary Delete a folder
// @Description Deletes the specified folder and all its contents
// @Tags File Storage
// @Produce json
// @Param projectId path string true "Project ID"
// @Param category path string true "Category"
// @Param folderPath path string true "Folder path to delete"
// @Success 200 {object} map[string]interface{} "Folder deleted successfully"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 404 {object} map[string]interface{} "Folder not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
func (h *FileStorageHandler) DeleteFolder(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	// Get parameters
	projectID := c.Param("projectId")
	category := c.Param("category")

	// Extract folder path from wildcard parameter
	folderPath := c.Param("*")

	// URL decode the folder path
	decodedFolderPath, decodeErr := url.QueryUnescape(folderPath)
	if decodeErr != nil {
		decodedFolderPath = folderPath
	}
	folderPath = decodedFolderPath

	if projectID == "" || category == "" || folderPath == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId, category, and folderPath are required",
		})
	}

	// Validate category
	cat := entity.FileCategory(category)
	if !cat.IsValid() {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("invalid category: %s", category),
		})
	}

	// Delete folder
	err := h.UseCase.DeleteFolder(ctx, projectID, category, folderPath)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "failed to delete folder: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "folder deleted successfully",
	})
}

// extractCategoryFromPath extracts category from URL path
// Example: "/api/filestorage/:projectId/map/upload" -> "map"
func extractCategoryFromPath(path string) string {
	parts := strings.Split(path, "/")
	if len(parts) >= 5 {
		return parts[4] // Category is at index 4
	}
	return ""
}
