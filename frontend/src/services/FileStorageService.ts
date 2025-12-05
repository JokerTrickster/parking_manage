/**
 * File Storage Service
 *
 * Service layer for File Storage API v0.1 communication
 * Handles all HTTP requests related to file upload, download, and listing
 */

import axios from 'axios';
import {
  FileCategory,
  FileInfo,
  UploadResponse,
  FileListResponse,
  AutoUploadResponse,
  FolderListResponse
} from '../models/FileStorage';
import { apiConfig, API_ENDPOINTS } from '../config/api';

// Axios instance configuration for File Storage API
const axiosConfig = {
  baseURL: apiConfig.BASE_URL,
  timeout: 300000, // 5 minutes for large file operations
};

const api = axios.create(axiosConfig);

/**
 * File Storage Service Class
 *
 * Provides methods for:
 * - Auto-upload (map editor integration)
 * - File upload with progress tracking
 * - File listing with pagination
 * - File download (specific version and latest)
 */
export class FileStorageService {
  /**
   * Auto-upload map file (fire-and-forget pattern)
   * Returns 202 Accepted immediately, actual upload happens in background
   *
   * @param projectId - Project identifier
   * @param file - Map JSON file to upload
   * @returns Auto-upload response with 202 status
   */
  static async autoUploadMap(
    projectId: string,
    file: File
  ): Promise<AutoUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = API_ENDPOINTS.FILE_STORAGE.AUTO_UPLOAD_MAP(projectId);

      console.log('[FileStorageService] Auto-uploading map:', {
        projectId,
        filename: file.name,
        size: file.size,
      });

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 2 minutes for auto-upload
      });

      console.log('[FileStorageService] Auto-upload initiated:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FileStorageService] Auto-upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload files with optional progress callback
   *
   * @param projectId - Project identifier
   * @param category - File category (map, cad, roi, learning, test)
   * @param files - Array of files to upload
   * @param onProgress - Optional callback for upload progress (0-100)
   * @returns Upload response with uploaded file information
   */
  static async uploadFiles(
    projectId: string,
    category: FileCategory,
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const endpoint = API_ENDPOINTS.FILE_STORAGE.UPLOAD(projectId, category);

      console.log('[FileStorageService] Uploading files:', {
        projectId,
        category,
        fileCount: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
      });

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      console.log('[FileStorageService] Upload complete:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FileStorageService] Upload failed:', error);
      throw error;
    }
  }

  /**
   * List files with pagination and filtering
   *
   * @param projectId - Project identifier
   * @param category - File category
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 100)
   * @param cctvId - Optional CCTV ID filter (learning/test only)
   * @returns File list response with pagination info
   */
  static async listFiles(
    projectId: string,
    category: FileCategory,
    page: number = 1,
    pageSize: number = 100,
    cctvId?: string
  ): Promise<FileListResponse> {
    try {
      const endpoint = API_ENDPOINTS.FILE_STORAGE.LIST(projectId, category, {
        page,
        pageSize,
        cctvId,
      });

      console.log('[FileStorageService] Listing files:', {
        projectId,
        category,
        page,
        pageSize,
        cctvId,
      });

      const response = await api.get(endpoint);

      console.log('[FileStorageService] Files listed:', {
        totalCount: response.data.data.total_count,
        pageFiles: response.data.data.files.length,
      });

      return response.data;
    } catch (error) {
      console.error('[FileStorageService] List files failed:', error);
      throw error;
    }
  }

  /**
   * Download specific file by filename
   *
   * @param projectId - Project identifier
   * @param category - File category
   * @param filename - Full filename with version
   * @returns File blob
   */
  static async downloadFile(
    projectId: string,
    category: FileCategory,
    filename: string
  ): Promise<Blob> {
    try {
      const endpoint = API_ENDPOINTS.FILE_STORAGE.DOWNLOAD(projectId, category, filename);

      console.log('[FileStorageService] Downloading file:', {
        projectId,
        category,
        filename,
      });

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      console.log('[FileStorageService] File downloaded:', {
        size: response.data.size,
        type: response.data.type,
      });

      return response.data;
    } catch (error) {
      console.error('[FileStorageService] Download failed:', error);
      throw error;
    }
  }

  /**
   * Download latest version of a file
   *
   * @param projectId - Project identifier
   * @param category - File category
   * @param originalName - Original filename without version
   * @returns File blob (latest version)
   */
  static async downloadLatest(
    projectId: string,
    category: FileCategory,
    originalName: string
  ): Promise<Blob> {
    try {
      const endpoint = API_ENDPOINTS.FILE_STORAGE.DOWNLOAD_LATEST(
        projectId,
        category,
        originalName
      );

      console.log('[FileStorageService] Downloading latest version:', {
        projectId,
        category,
        originalName,
      });

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      console.log('[FileStorageService] Latest version downloaded:', {
        size: response.data.size,
        type: response.data.type,
      });

      return response.data;
    } catch (error) {
      console.error('[FileStorageService] Download latest failed:', error);
      throw error;
    }
  }

  /**
   * Delete file by filename
   *
   * @param projectId - Project identifier
   * @param category - File category
   * @param filename - Full filename with version to delete
   * @returns Delete response
   */
  static async deleteFile(
    projectId: string,
    category: FileCategory,
    filename: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = API_ENDPOINTS.FILE_STORAGE.DELETE(projectId, category, filename);

      console.log('[FileStorageService] Deleting file:', {
        projectId,
        category,
        filename,
      });

      const response = await api.delete(endpoint);

      console.log('[FileStorageService] File deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FileStorageService] Delete failed:', error);
      throw error;
    }
  }

  /**
   * Delete multiple files in batch
   *
   * @param projectId - Project identifier
   * @param category - File category
   * @param filenames - Array of filenames to delete
   * @returns Delete response
   */
  static async deleteFiles(
    projectId: string,
    category: FileCategory,
    filenames: string[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = API_ENDPOINTS.FILE_STORAGE.BATCH_DELETE(projectId, category);

      console.log('[FileStorageService] Batch deleting files:', {
        projectId,
        category,
        fileCount: filenames.length,
      });

      const response = await api.post(endpoint, { filenames });

      console.log('[FileStorageService] Files deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FileStorageService] Batch delete failed:', error);
      throw error;
    }
  }

  /**
   * Delete folder and all its contents
   *
   * @param projectId - Project identifier
   * @param category - File category
   * @param folderPath - Folder path to delete
   * @returns Delete response
   */
  static async deleteFolder(
    projectId: string,
    category: FileCategory,
    folderPath: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = API_ENDPOINTS.FILE_STORAGE.DELETE_FOLDER(projectId, category, folderPath);

      console.log('[FileStorageService] Deleting folder:', {
        projectId,
        category,
        folderPath,
      });

      const response = await api.delete(endpoint);

      console.log('[FileStorageService] Folder deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FileStorageService] Delete folder failed:', error);
      throw error;
    }
  }

  /**
   * Trigger browser download for a blob
   * Creates temporary download link and triggers click
   *
   * @param blob - File blob to download
   * @param filename - Desired filename for download
   */
  static triggerBrowserDownload(blob: Blob, filename: string): void {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('[FileStorageService] Browser download triggered:', filename);
    } catch (error) {
      console.error('[FileStorageService] Browser download failed:', error);
      throw error;
    }
  }

  /**
   * Format file size for display
   *
   * @param bytes - File size in bytes
   * @returns Formatted string (e.g., "2.5 MB")
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  /**
   * Helper method to find a folder by path in nested structure
   * @private
   */
  private static findFolderByPath(folders: any[], path: string): any | null {
    for (const folder of folders) {
      if (folder.path === path) {
        return folder;
      }

      // Recursively search in subfolders
      if (folder.subfolders && folder.subfolders.length > 0) {
        const found = this.findFolderByPath(folder.subfolders, path);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  /**
   * List folders for learning/test categories with nested folder support
   *
   * @param projectId - Project identifier
   * @param category - File category (learning or test)
   * @param currentPath - Current folder path for nested navigation (optional)
   * @returns Folder list response
   */
  static async listFolders(
    projectId: string,
    category: FileCategory,
    currentPath?: string
  ): Promise<FolderListResponse> {
    try {
      let endpoint = API_ENDPOINTS.FILE_STORAGE.LIST_FOLDERS(projectId, category);

      // Add path query parameter if provided
      if (currentPath) {
        endpoint += `?path=${encodeURIComponent(currentPath)}`;
      }

      console.log('[FileStorageService] Listing folders:', {
        projectId,
        category,
        currentPath,
      });

      const response = await api.get(endpoint);

      console.log('[FileStorageService] Folders listed:', {
        foldersCount: response.data.data?.folders?.length || 0,
        folders: response.data.data?.folders || [],
      });

      // Transform NestedFolderListResponse to FolderListResponse for backward compatibility
      // Convert folders array (new format) to items array (old format expected by FileRepositoryViewModel)
      const folders = response.data.data?.folders || [];
      const items: any[] = [];

      // If navigating to a specific folder, show its subfolders and files
      if (currentPath) {
        // Find the target folder by path
        const targetFolder = this.findFolderByPath(folders, currentPath);

        if (targetFolder) {
          // Add subfolders as items
          if (targetFolder.subfolders) {
            targetFolder.subfolders.forEach((subfolder: any) => {
              items.push({
                name: subfolder.name,
                path: subfolder.path,
                isFolder: true,
                count: subfolder.file_count || 0,
              });
            });
          }

          // Add files as items
          if (targetFolder.files) {
            targetFolder.files.forEach((file: any) => {
              items.push({
                name: file.name,
                path: `${currentPath}/${file.name}`,
                isFolder: false,
                size: file.size,
                uploadDate: file.created_at,
              });
            });
          }
        }
      } else {
        // At root level, show top-level folders only
        folders.forEach((folder: any) => {
          items.push({
            name: folder.name,
            path: folder.path,
            isFolder: true,
            count: folder.subfolders?.length || folder.file_count || 0,
          });
        });
      }

      return {
        success: response.data.success,
        message: response.data.message,
        data: {
          items: items,
          total: items.length,
          currentPath: currentPath || '',
        },
      };
    } catch (error) {
      console.error('[FileStorageService] List folders failed:', error);
      throw error;
    }
  }

  /**
   * Format date for display (Korean format)
   *
   * @param isoDate - ISO 8601 date string
   * @returns Formatted date string
   */
  static formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
