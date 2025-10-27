package usecase

import (
	"context"
	"fmt"
	"io"
	"sort"
	"strings"
	"time"

	"main/features/filestorage/model/entity"
	_interface "main/features/filestorage/model/interface"
	"main/features/filestorage/model/request"
	"main/features/filestorage/model/response"
	"main/features/filestorage/util"
)

type FileStorageUseCase struct {
	Repository     _interface.IFileStorageRepository
	ContextTimeout time.Duration
}

func NewFileStorageUseCase(repo _interface.IFileStorageRepository, timeout time.Duration) _interface.IFileStorageUseCase {
	return &FileStorageUseCase{
		Repository:     repo,
		ContextTimeout: timeout,
	}
}

// UploadFile handles file upload with optional versioning
func (u *FileStorageUseCase) UploadFile(ctx context.Context, req request.UploadRequest) (response.ResUpload, error) {
	_, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	// Validate category
	category := entity.FileCategory(req.Category)
	if !category.IsValid() {
		return response.ResUpload{}, fmt.Errorf("invalid category: %s", req.Category)
	}

	var uploadedFiles []entity.FileInfo
	var errors []string
	successCount := 0
	failedCount := 0
	version := ""

	// Determine if versioning is needed
	isVersioned := category.IsVersioned()
	if isVersioned {
		version = util.GetTimestamp()
	}

	for _, fileHeader := range req.Files {
		// Open file
		file, err := fileHeader.Open()
		if err != nil {
			errors = append(errors, fmt.Sprintf("failed to open %s: %v", fileHeader.Filename, err))
			failedCount++
			continue
		}

		// Determine filename (with or without versioning)
		filename := fileHeader.Filename
		originalName := fileHeader.Filename

		if isVersioned {
			filename = util.GenerateVersionedFilename(fileHeader.Filename)
		} else {
			// For non-versioned files (learning/test images), preserve folder structure
			// Extract relative path from Content-Disposition header
			contentDisposition := fileHeader.Header.Get("Content-Disposition")
			if contentDisposition != "" {
				if filenameStart := strings.Index(contentDisposition, "filename=\""); filenameStart != -1 {
					filenameStart += 10
					if filenameEnd := strings.Index(contentDisposition[filenameStart:], "\""); filenameEnd != -1 {
						relativePath := contentDisposition[filenameStart : filenameStart+filenameEnd]
						filename = relativePath
					}
				}
			}
		}

		// Save file
		if err := u.Repository.SaveFile(req.ProjectID, req.Category, filename, file); err != nil {
			errors = append(errors, fmt.Sprintf("failed to save %s: %v", fileHeader.Filename, err))
			failedCount++
			file.Close()
			continue
		}

		file.Close()

		// Get file metadata
		fileInfo, err := u.Repository.GetFileMetadata(req.ProjectID, req.Category, filename)
		if err != nil {
			// File saved but metadata retrieval failed - still count as success
			fileInfo = entity.FileInfo{
				Filename:     filename,
				OriginalName: originalName,
				Version:      version,
			}
		}

		uploadedFiles = append(uploadedFiles, fileInfo)
		successCount++
	}

	return response.ResUpload{
		TotalFiles:    len(req.Files),
		SuccessCount:  successCount,
		FailedCount:   failedCount,
		Version:       version,
		UploadedFiles: uploadedFiles,
		Errors:        errors,
	}, nil
}

// ListFiles returns file list with metadata
func (u *FileStorageUseCase) ListFiles(ctx context.Context, req request.FileQueryRequest) (response.ResFileList, error) {
	_, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	// Validate category
	category := entity.FileCategory(req.Category)
	if !category.IsValid() {
		return response.ResFileList{}, fmt.Errorf("invalid category: %s", req.Category)
	}

	// Get files from repository
	files, err := u.Repository.ListFiles(req.ProjectID, req.Category, req.Filters)
	if err != nil {
		return response.ResFileList{}, err
	}

	// Sort files by upload date (newest first)
	sort.Slice(files, func(i, j int) bool {
		return files[i].UploadDate.After(files[j].UploadDate)
	})

	// Apply pagination
	page := req.Page
	if page < 1 {
		page = 1
	}

	pageSize := req.PageSize
	if pageSize < 1 {
		pageSize = 100
	}

	totalFiles := len(files)
	totalPages := (totalFiles + pageSize - 1) / pageSize

	// Calculate slice bounds
	startIdx := (page - 1) * pageSize
	endIdx := startIdx + pageSize

	if startIdx >= totalFiles {
		// Page out of range
		return response.ResFileList{
			TotalCount: totalFiles,
			Files:      []entity.FileInfo{},
			Pagination: response.Pagination{
				Page:       page,
				PageSize:   pageSize,
				TotalPages: totalPages,
			},
		}, nil
	}

	if endIdx > totalFiles {
		endIdx = totalFiles
	}

	paginatedFiles := files[startIdx:endIdx]

	return response.ResFileList{
		TotalCount: totalFiles,
		Files:      paginatedFiles,
		Pagination: response.Pagination{
			Page:       page,
			PageSize:   pageSize,
			TotalPages: totalPages,
		},
	}, nil
}

// DownloadFile retrieves file for download
func (u *FileStorageUseCase) DownloadFile(ctx context.Context, projectID, category, filename string) (io.ReadCloser, entity.FileInfo, error) {
	_, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	// Validate category
	cat := entity.FileCategory(category)
	if !cat.IsValid() {
		return nil, entity.FileInfo{}, fmt.Errorf("invalid category: %s", category)
	}

	// Get file metadata
	fileInfo, err := u.Repository.GetFileMetadata(projectID, category, filename)
	if err != nil {
		return nil, entity.FileInfo{}, fmt.Errorf("file not found: %w", err)
	}

	// Open file for reading
	file, err := u.Repository.ReadFile(projectID, category, filename)
	if err != nil {
		return nil, entity.FileInfo{}, fmt.Errorf("failed to read file: %w", err)
	}

	return file, fileInfo, nil
}

// GetLatestVersion returns the most recent version of a file
func (u *FileStorageUseCase) GetLatestVersion(ctx context.Context, projectID, category, originalName string) (string, error) {
	_, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	// Validate category
	cat := entity.FileCategory(category)
	if !cat.IsValid() {
		return "", fmt.Errorf("invalid category: %s", category)
	}

	if !cat.IsVersioned() {
		return "", fmt.Errorf("category %s does not support versioning", category)
	}

	// List all files
	files, err := u.Repository.ListFiles(projectID, category, nil)
	if err != nil {
		return "", err
	}

	// Filter files by original name
	var matchingFiles []entity.FileInfo
	for _, file := range files {
		if file.OriginalName == originalName {
			matchingFiles = append(matchingFiles, file)
		}
	}

	if len(matchingFiles) == 0 {
		return "", fmt.Errorf("no versions found for file: %s", originalName)
	}

	// Sort by upload date (newest first)
	sort.Slice(matchingFiles, func(i, j int) bool {
		return matchingFiles[i].UploadDate.After(matchingFiles[j].UploadDate)
	})

	// Return latest version filename
	return matchingFiles[0].Filename, nil
}
