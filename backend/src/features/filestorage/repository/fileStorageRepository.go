package repository

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"main/common"
	"main/common/db/mysql"
	"main/features/filestorage/model/entity"
	"main/features/filestorage/util"

	"gorm.io/gorm"
)

type FileStorageRepository struct {
	DB *gorm.DB
}

func NewFileStorageRepository(db *gorm.DB) *FileStorageRepository {
	return &FileStorageRepository{
		DB: db,
	}
}

// SaveFile saves a file to the filesystem and returns the actual saved filename
func (r *FileStorageRepository) SaveFile(projectID, category, filename string, file multipart.File) (string, error) {
	// Build full path
	basePath := common.Env.UploadPath
	categoryPath := filepath.Join(basePath, projectID, category)

	// Full file path (filename may include subdirectories)
	filePath := filepath.Join(categoryPath, filename)

	// Extract directory from full file path and create all necessary directories
	fileDir := filepath.Dir(filePath)
	if err := os.MkdirAll(fileDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	// Handle duplicate filenames by adding _1, _2, etc.
	finalPath := r.getUniqueFilePath(filePath)

	// Create file
	dst, err := os.Create(finalPath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Copy content
	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	// Extract the actual saved filename (relative to category path)
	savedFilename, err := filepath.Rel(categoryPath, finalPath)
	if err != nil {
		// Fallback to just the base name if relative path fails
		savedFilename = filepath.Base(finalPath)
	}

	return savedFilename, nil
}

// getUniqueFilePath returns a unique file path by appending _1, _2, etc. if file exists
func (r *FileStorageRepository) getUniqueFilePath(filePath string) string {
	// If file doesn't exist, return original path
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return filePath
	}

	// Extract directory, filename, and extension
	dir := filepath.Dir(filePath)
	ext := filepath.Ext(filePath)
	nameWithoutExt := strings.TrimSuffix(filepath.Base(filePath), ext)

	// Try appending _1, _2, _3, etc. until we find a unique name
	counter := 1
	for {
		newName := fmt.Sprintf("%s_%d%s", nameWithoutExt, counter, ext)
		newPath := filepath.Join(dir, newName)

		if _, err := os.Stat(newPath); os.IsNotExist(err) {
			return newPath
		}

		counter++

		// Safety check to prevent infinite loop
		if counter > 1000 {
			// Return a path with process ID as last resort
			return filepath.Join(dir, fmt.Sprintf("%s_%d%s", nameWithoutExt, os.Getpid(), ext))
		}
	}
}

// SaveFileHistory saves file upload history to database
func (r *FileStorageRepository) SaveFileHistory(history *mysql.FileStorageHistory) error {
	if r.DB == nil {
		// DB not initialized, skip saving to database
		fmt.Println("Warning: DB is nil, skipping file history save")
		return nil
	}

	fmt.Printf("Saving file history to DB: %+v\n", history)
	result := r.DB.Create(history)
	if result.Error != nil {
		return fmt.Errorf("failed to save file history: %w", result.Error)
	}

	fmt.Println("Successfully saved file history to DB")
	return nil
}

// ListFiles returns all files for a project category with optional filters
func (r *FileStorageRepository) ListFiles(projectID, category string, filters map[string]string) ([]entity.FileInfo, error) {
	basePath := common.Env.UploadPath
	categoryPath := filepath.Join(basePath, projectID, category)

	// Check if directory exists
	if _, err := os.Stat(categoryPath); os.IsNotExist(err) {
		return []entity.FileInfo{}, nil // Return empty list if directory doesn't exist
	}

	var files []entity.FileInfo

	// Handle CCTV ID filter for learning/test categories
	cctvID := filters["cctv_id"]
	if cctvID != "" {
		// List files in specific CCTV ID folder
		cctvPath := filepath.Join(categoryPath, cctvID)
		if _, err := os.Stat(cctvPath); os.IsNotExist(err) {
			return []entity.FileInfo{}, nil
		}

		files, err := r.listFilesInDirectory(cctvPath, projectID, category, cctvID)
		if err != nil {
			return nil, err
		}
		return files, nil
	}

	// Walk through all files
	err := filepath.Walk(categoryPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Extract CCTV ID if in subdirectory
		relPath, _ := filepath.Rel(categoryPath, path)
		cctvIDFromPath := ""
		if strings.Contains(relPath, string(filepath.Separator)) {
			cctvIDFromPath = filepath.Dir(relPath)
		}

		// Get original name and version
		originalName, version, _ := util.ParseVersionFromFilename(info.Name())

		fileInfo := entity.FileInfo{
			Filename:     info.Name(),
			OriginalName: originalName,
			Version:      version,
			SizeBytes:    info.Size(),
			UploadDate:   info.ModTime(),
			FileType:     r.detectMimeType(info.Name()),
			Path:         path,
			CctvID:       cctvIDFromPath,
		}

		files = append(files, fileInfo)
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to list files: %w", err)
	}

	return files, nil
}

// listFilesInDirectory lists files in a specific directory
func (r *FileStorageRepository) listFilesInDirectory(dirPath, projectID, category, cctvID string) ([]entity.FileInfo, error) {
	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read directory: %w", err)
	}

	var files []entity.FileInfo
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		info, err := entry.Info()
		if err != nil {
			continue
		}

		originalName, version, _ := util.ParseVersionFromFilename(info.Name())

		fileInfo := entity.FileInfo{
			Filename:     info.Name(),
			OriginalName: originalName,
			Version:      version,
			SizeBytes:    info.Size(),
			UploadDate:   info.ModTime(),
			FileType:     r.detectMimeType(info.Name()),
			Path:         filepath.Join(dirPath, info.Name()),
			CctvID:       cctvID,
		}

		files = append(files, fileInfo)
	}

	return files, nil
}

// ReadFile returns file content as io.ReadCloser
func (r *FileStorageRepository) ReadFile(projectID, category, filename string) (io.ReadCloser, error) {
	basePath := common.Env.UploadPath
	filePath := filepath.Join(basePath, projectID, category, filename)

	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}

	return file, nil
}

// DeleteFile removes a file from the filesystem
func (r *FileStorageRepository) DeleteFile(projectID, category, filename string) error {
	basePath := common.Env.UploadPath
	filePath := filepath.Join(basePath, projectID, category, filename)

	if err := os.Remove(filePath); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}

// DeleteFiles removes multiple files from the filesystem
func (r *FileStorageRepository) DeleteFiles(projectID, category string, filenames []string) error {
	basePath := common.Env.UploadPath

	var errors []string
	successCount := 0

	for _, filename := range filenames {
		filePath := filepath.Join(basePath, projectID, category, filename)

		if err := os.Remove(filePath); err != nil {
			errors = append(errors, fmt.Sprintf("failed to delete %s: %v", filename, err))
		} else {
			successCount++
		}
	}

	if len(errors) > 0 {
		return fmt.Errorf("deleted %d files, failed %d: %s", successCount, len(errors), strings.Join(errors, "; "))
	}

	return nil
}

// DeleteFolder removes a folder and all its contents from the filesystem
func (r *FileStorageRepository) DeleteFolder(projectID, category, folderPath string) error {
	basePath := common.Env.UploadPath
	fullPath := filepath.Join(basePath, projectID, category, folderPath)

	// Check if path exists and is a directory
	info, err := os.Stat(fullPath)
	if err != nil {
		return fmt.Errorf("failed to stat folder: %w", err)
	}

	if !info.IsDir() {
		return fmt.Errorf("path is not a directory: %s", folderPath)
	}

	// Remove directory and all contents
	if err := os.RemoveAll(fullPath); err != nil {
		return fmt.Errorf("failed to delete folder: %w", err)
	}

	return nil
}

// GetFileMetadata returns file information
func (r *FileStorageRepository) GetFileMetadata(projectID, category, filename string) (entity.FileInfo, error) {
	basePath := common.Env.UploadPath
	filePath := filepath.Join(basePath, projectID, category, filename)

	info, err := os.Stat(filePath)
	if err != nil {
		return entity.FileInfo{}, fmt.Errorf("failed to get file info: %w", err)
	}

	originalName, version, _ := util.ParseVersionFromFilename(info.Name())

	return entity.FileInfo{
		Filename:     info.Name(),
		OriginalName: originalName,
		Version:      version,
		SizeBytes:    info.Size(),
		UploadDate:   info.ModTime(),
		FileType:     r.detectMimeType(info.Name()),
		Path:         filePath,
	}, nil
}

// FileExists checks if a file exists
func (r *FileStorageRepository) FileExists(projectID, category, filename string) bool {
	basePath := common.Env.UploadPath
	filePath := filepath.Join(basePath, projectID, category, filename)

	_, err := os.Stat(filePath)
	return err == nil
}

// detectMimeType detects MIME type based on file extension
func (r *FileStorageRepository) detectMimeType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))

	mimeTypes := map[string]string{
		".json": "application/json",
		".dwg":  "application/acad",
		".dxf":  "application/dxf",
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".bmp":  "image/bmp",
		".pdf":  "application/pdf",
		".txt":  "text/plain",
	}

	if mimeType, ok := mimeTypes[ext]; ok {
		return mimeType
	}

	return "application/octet-stream"
}
