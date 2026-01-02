package usecase

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"main/common/db/mysql"
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
	ctx, cancel := context.WithTimeout(ctx, u.ContextTimeout)
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

		if isVersioned {
			filename = util.GenerateVersionedFilename(fileHeader.Filename)
		} else {
			// For non-versioned files (learning/test images), use folder_path if provided
			if req.FolderPath != "" {
				// Prepend folder_path to filename
				filename = filepath.Join(req.FolderPath, fileHeader.Filename)
			} else {
				// Extract relative path from Content-Disposition header if present
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
		}

		// Save file - returns the actual saved filename (may differ due to duplicate handling)
		savedFilename, err := u.Repository.SaveFile(req.ProjectID, req.Category, filename, file)
		if err != nil {
			errors = append(errors, fmt.Sprintf("failed to save %s: %v", fileHeader.Filename, err))
			failedCount++
			file.Close()
			continue
		}

		file.Close()

		// Get file metadata using the actual saved filename
		fileInfo, err := u.Repository.GetFileMetadata(req.ProjectID, req.Category, savedFilename)
		if err != nil {
			// File saved but metadata retrieval failed - still count as success
			fileInfo = entity.FileInfo{
				Filename:     savedFilename,
				OriginalName: savedFilename, // Use saved filename (with timestamp) as original name
				Version:      version,
			}
		}

		// Save to database
		cctvID := extractCctvIdFromPath(savedFilename)
		history := &mysql.FileStorageHistory{
			ProjectId:    req.ProjectID,
			Category:     req.Category,
			Filename:     savedFilename,
			OriginalName: savedFilename, // Use saved filename (with timestamp) as original name
			Version:      version,
			FilePath:     filepath.Join(req.ProjectID, req.Category, savedFilename),
			FileSize:     fileInfo.SizeBytes,
			FileType:     fileInfo.FileType,
			CctvId:       cctvID,
			// UserId, UploadIp, UploadUserAgent can be added later when auth is implemented
		}

		if err := u.Repository.SaveFileHistory(history); err != nil {
			// Log error but don't fail the upload
			fmt.Printf("Warning: Failed to save file history to DB: %v\n", err)
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

// extractCctvIdFromPath extracts CCTV ID from file path if present
func extractCctvIdFromPath(filename string) *string {
	// Check if filename contains directory separator
	if strings.Contains(filename, string(filepath.Separator)) {
		// Extract directory name as CCTV ID
		dir := filepath.Dir(filename)
		if dir != "." && dir != "/" {
			return &dir
		}
	}
	return nil
}

// ListFiles returns file list with metadata
func (u *FileStorageUseCase) ListFiles(ctx context.Context, req request.FileQueryRequest) (response.ResFileList, error) {
	ctx, cancel := context.WithTimeout(ctx, u.ContextTimeout)
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
	ctx, cancel := context.WithTimeout(ctx, u.ContextTimeout)
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

// ListFolders returns folder structure for roi/learning/test categories with nested folder support
func (u *FileStorageUseCase) ListFolders(ctx context.Context, projectID, category string, currentPath ...string) (interface{}, error) {
	ctx, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	// List all files
	files, err := u.Repository.ListFiles(projectID, category, nil)
	if err != nil {
		return nil, err
	}

	// Build folder structure
	folderMap := make(map[string]*FolderNode)

	for _, file := range files {
		// Extract relative path from file.Path
		categoryIndex := strings.Index(file.Path, string(filepath.Separator)+category+string(filepath.Separator))
		if categoryIndex == -1 {
			continue
		}

		startIndex := categoryIndex + len(string(filepath.Separator)) + len(category) + len(string(filepath.Separator))
		relativePath := file.Path[startIndex:]

		if relativePath == "" {
			continue
		}

		// Split path into parts (e.g., "2025-01-01/P1_B2_3/image.jpg" -> ["2025-01-01", "P1_B2_3", "image.jpg"])
		parts := strings.Split(relativePath, string(filepath.Separator))
		if len(parts) == 0 {
			continue
		}

		// For ROI category: flat structure (files only at root level)
		if category == "roi" {
			// All files are at root level
			rootFolder := folderMap["root"]
			if rootFolder == nil {
				rootFolder = &FolderNode{
					Name:       "root",
					Path:       "",
					Files:      []FileNode{},
					Subfolders: []FolderNode{},
					FileCount:  0,
					CreatedAt:  file.UploadDate.Format("2006-01-02T15:04:05Z07:00"),
				}
				folderMap["root"] = rootFolder
			}

			rootFolder.Files = append(rootFolder.Files, FileNode{
				Name:      file.Filename,
				Size:      file.SizeBytes,
				CreatedAt: file.UploadDate.Format("2006-01-02T15:04:05Z07:00"),
			})
			rootFolder.FileCount++
		} else if category == "learning" || category == "test" {
			// Learning/Test category: 2-level nested structure (timestamp/cctvId/images)
			if len(parts) >= 2 {
				// First level: timestamp folder (e.g., "2025-01-01_10-30-00")
				timestampFolder := parts[0]
				cctvFolder := parts[1]
				filename := parts[len(parts)-1]

				// Get or create timestamp folder
				folder := folderMap[timestampFolder]
				if folder == nil {
					folder = &FolderNode{
						Name:       timestampFolder,
						Path:       timestampFolder,
						Files:      []FileNode{},
						Subfolders: []FolderNode{},
						FileCount:  0,
						CreatedAt:  file.UploadDate.Format("2006-01-02T15:04:05Z07:00"),
					}
					folderMap[timestampFolder] = folder
				}

				// Find or create CCTV subfolder (use index instead of pointer to avoid slice reallocation issues)
				cctvIndex := -1
				for i := range folder.Subfolders {
					if folder.Subfolders[i].Name == cctvFolder {
						cctvIndex = i
						break
					}
				}

				if cctvIndex == -1 {
					// Create new CCTV subfolder
					newCctvNode := FolderNode{
						Name:       cctvFolder,
						Path:       filepath.Join(timestampFolder, cctvFolder),
						Files:      []FileNode{},
						Subfolders: []FolderNode{},
						FileCount:  0,
						CreatedAt:  file.UploadDate.Format("2006-01-02T15:04:05Z07:00"),
					}
					folder.Subfolders = append(folder.Subfolders, newCctvNode)
					cctvIndex = len(folder.Subfolders) - 1
				}

				// Add file to CCTV folder using index (safe against slice reallocation)
				folder.Subfolders[cctvIndex].Files = append(folder.Subfolders[cctvIndex].Files, FileNode{
					Name:      filename,
					Size:      file.SizeBytes,
					CreatedAt: file.UploadDate.Format("2006-01-02T15:04:05Z07:00"),
				})
				folder.Subfolders[cctvIndex].FileCount++
			}
		}
	}

	// Convert map to slice
	folders := make([]FolderNode, 0, len(folderMap))
	for _, folder := range folderMap {
		folders = append(folders, *folder)
	}

	// Sort folders by name
	sort.Slice(folders, func(i, j int) bool {
		return folders[i].Name < folders[j].Name
	})

	return map[string]interface{}{
		"folders": folders,
	}, nil
}

// FolderNode represents a folder in the file structure
type FolderNode struct {
	Name       string       `json:"name"`
	Path       string       `json:"path"`
	Files      []FileNode   `json:"files"`
	Subfolders []FolderNode `json:"subfolders"`
	FileCount  int          `json:"file_count"`
	CreatedAt  string       `json:"created_at"`
}

// FileNode represents a file in the file structure
type FileNode struct {
	Name      string `json:"name"`
	Size      int64  `json:"size"`
	CreatedAt string `json:"created_at"`
}

// GetLatestVersion returns the most recent version of a file

func (u *FileStorageUseCase) GetLatestVersion(ctx context.Context, projectID, category, originalName string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, u.ContextTimeout)
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

// DeleteFile removes a file from storage
func (u *FileStorageUseCase) DeleteFile(ctx context.Context, projectID, category, filename string) error {
	ctx, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	// Validate category
	cat := entity.FileCategory(category)
	if !cat.IsValid() {
		return fmt.Errorf("invalid category: %s", category)
	}

	// Delete file using repository
	if err := u.Repository.DeleteFile(projectID, category, filename); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}

// DeleteFiles removes multiple files from storage
func (u *FileStorageUseCase) DeleteFiles(ctx context.Context, projectID, category string, filenames []string) error {
	ctx, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	// Validate category
	cat := entity.FileCategory(category)
	if !cat.IsValid() {
		return fmt.Errorf("invalid category: %s", category)
	}

	// Delete files using repository
	if err := u.Repository.DeleteFiles(projectID, category, filenames); err != nil {
		return fmt.Errorf("failed to delete files: %w", err)
	}

	return nil
}

// DeleteFolder removes a folder and all its contents from storage
func (u *FileStorageUseCase) DeleteFolder(ctx context.Context, projectID, category, folderPath string) error {
	ctx, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	// Validate category
	cat := entity.FileCategory(category)
	if !cat.IsValid() {
		return fmt.Errorf("invalid category: %s", category)
	}

	// Delete folder using repository
	if err := u.Repository.DeleteFolder(projectID, category, folderPath); err != nil {
		return fmt.Errorf("failed to delete folder: %w", err)
	}

	return nil
}
