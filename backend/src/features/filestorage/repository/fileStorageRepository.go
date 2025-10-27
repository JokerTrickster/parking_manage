package repository

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"main/common"
	"main/features/filestorage/model/entity"
	"main/features/filestorage/util"
)

type FileStorageRepository struct{}

func NewFileStorageRepository() *FileStorageRepository {
	return &FileStorageRepository{}
}

// SaveFile saves a file to the filesystem
func (r *FileStorageRepository) SaveFile(projectID, category, filename string, file multipart.File) error {
	// Build full path
	basePath := common.Env.UploadPath
	categoryPath := filepath.Join(basePath, projectID, category)

	// Create directory if not exists
	if err := os.MkdirAll(categoryPath, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Full file path
	filePath := filepath.Join(categoryPath, filename)

	// Create file
	dst, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Copy content
	if _, err := io.Copy(dst, file); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

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
