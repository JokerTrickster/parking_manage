/**
 * File Storage Models and Types
 *
 * TypeScript interfaces for File Storage API v0.1
 * Matches backend response structures from Go backend
 */

// File category type - 5 categories supported
export type FileCategory = 'map' | 'cad' | 'roi' | 'learning' | 'test';

/**
 * File information structure
 * Matches backend entity: backend/src/features/filestorage/model/entity/fileInfo.go
 */
export interface FileInfo {
  filename: string;           // Actual filename with version (e.g., "parking_map_1234567890.json")
  original_name: string;      // Original filename without version (e.g., "parking_map.json")
  version: string;            // Version timestamp (e.g., "1234567890")
  size_bytes: number;         // File size in bytes
  upload_date: string;        // Upload date in ISO 8601 format
  file_type: string;          // MIME type (e.g., "application/json")
  path: string;               // Server file path
  cctv_id?: string;           // CCTV ID (only for learning/test categories)
}

/**
 * Upload response structure
 * Matches backend response: backend/src/features/filestorage/model/response/upload.go
 */
export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    total_files: number;
    success_count: number;
    failed_count: number;
    version?: string;
    uploaded_files: FileInfo[];
    errors?: string[];
  };
}

/**
 * File list response structure with pagination
 * Matches backend response: backend/src/features/filestorage/model/response/fileList.go
 */
export interface FileListResponse {
  success: boolean;
  message: string;
  data: {
    total_count: number;
    files: FileInfo[];
    pagination: {
      page: number;
      page_size: number;
      total_pages: number;
    };
  };
}

/**
 * Auto-upload response structure (202 Accepted)
 * Used for map editor auto-save feature
 */
export interface AutoUploadResponse {
  success: boolean;
  message: string;
  data: {
    project_id: string;
    filename: string;
  };
}

/**
 * File repository state interface
 * Used by FileRepositoryViewModel for state management
 */
export interface FileRepositoryState {
  currentCategory: FileCategory;
  files: FileInfo[];
  folders: FolderNode[];      // Folder/file list for learning/test categories
  selectedFolder: FolderNode | null;  // Currently selected folder
  currentPath: string;         // Current folder path for nested navigation
  viewMode: 'folders' | 'files';  // View mode: folders or files
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
  selectedCctvId?: string;    // For learning/test category filtering
  uploadProgress: number;     // Upload progress percentage (0-100)
}

/**
 * Auto-save state interface
 * Used by MapEditorAutoSaveViewModel
 */
export interface AutoSaveState {
  saving: boolean;            // Currently saving
  success: boolean | null;    // Save result (null = not attempted, true = success, false = failed)
  error: string | null;       // Error message if failed
}

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Chunk upload options
 */
export interface ChunkUploadOptions {
  projectId: string;
  category: FileCategory;
  file: File;
  chunkSize?: number;         // Chunk size in bytes (default: 5MB)
  onProgress?: (progress: number) => void;
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
}

/**
 * Folder/File node structure for learning/test categories
 */
export interface FolderNode {
  name: string;               // Folder/file name
  path: string;               // Full path relative to category
  isFolder: boolean;          // true = folder, false = file
  count?: number;             // Number of items inside (for folders)
  size?: number;              // File size in bytes (for files)
  uploadDate?: string;        // Upload date (for files)
}

/**
 * Folder list response
 */
export interface FolderListResponse {
  success: boolean;
  message: string;
  data: {
    items: FolderNode[];      // List of folders and files
    total: number;
    currentPath: string;       // Current folder path
  };
}
