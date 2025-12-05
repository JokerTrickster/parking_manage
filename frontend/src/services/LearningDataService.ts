/**
 * Learning Data Management Service
 *
 * Service layer for Learning Data Management feature
 * Handles API calls for ROI file selection, learning folder selection, and image editing
 */

import axios from 'axios';
import { apiConfig, API_ENDPOINTS } from '../config/api';
import {
  LearningFolder,
  CCTVInfo,
  ROIFileData,
  SaveEditedImageRequest,
  SaveEditedImageResponse,
} from '../models/LearningDataManagement';
import { NestedFolderListResponse } from '../models/FileStorage';

const axiosConfig = {
  baseURL: apiConfig.BASE_URL,
  timeout: 300000, // 5 minutes for large operations
};

const api = axios.create(axiosConfig);

export class LearningDataService {
  /**
   * Get list of ROI files from FileStorage
   */
  static async getROIFileList(projectId: string): Promise<string[]> {
    try {
      console.log('[LearningDataService] Fetching ROI files for project:', projectId);

      const endpoint = API_ENDPOINTS.FILE_STORAGE.LIST_FOLDERS(projectId, 'roi');
      const response = await api.get<NestedFolderListResponse>(endpoint);

      console.log('[LearningDataService] ROI files response:', response.data);

      if (response.data.success && response.data.data) {
        // Extract file names from folder structure
        const files: string[] = [];
        response.data.data.folders.forEach((folder: any) => {
          if (folder.files) {
            files.push(...folder.files.map((f: any) => f.name));
          }
        });
        return files.filter((f: string) => f.endsWith('.json'));
      }

      return [];
    } catch (error) {
      console.error('[LearningDataService] Failed to fetch ROI files:', error);
      throw error;
    }
  }

  /**
   * Get ROI file data by filename
   */
  static async getROIFileData(projectId: string, roiFileName: string): Promise<ROIFileData> {
    try {
      console.log('[LearningDataService] Fetching ROI file data:', { projectId, roiFileName });

      // Remove version suffix from filename to get original_name
      // Format: "filename_1234567890.json" -> "filename.json"
      const originalName = this.removeVersionSuffix(roiFileName);

      console.log('[LearningDataService] Original name:', originalName);

      const endpoint = API_ENDPOINTS.FILE_STORAGE.DOWNLOAD_LATEST(projectId, 'roi', originalName);
      const response = await api.get(endpoint, {
        responseType: 'json'
      });

      console.log('[LearningDataService] ROI file data:', response.data);
      return response.data;
    } catch (error) {
      console.error('[LearningDataService] Failed to fetch ROI file data:', error);
      throw error;
    }
  }

  /**
   * Remove version suffix from filename
   * Format: "filename_1234567890.ext" -> "filename.ext"
   * @private
   */
  private static removeVersionSuffix(filename: string): string {
    // Match pattern: anything_digits.extension
    const match = filename.match(/^(.+)_(\d+)(\.[^.]+)$/);
    if (match) {
      return match[1] + match[3]; // name + extension
    }
    return filename; // No version suffix found, return as-is
  }

  /**
   * Get list of learning data folders
   */
  static async getLearningFolders(projectId: string): Promise<LearningFolder[]> {
    try {
      console.log('[LearningDataService] Fetching learning folders for project:', projectId);

      const endpoint = API_ENDPOINTS.FILE_STORAGE.LIST_FOLDERS(projectId, 'learning');
      const response = await api.get<NestedFolderListResponse>(endpoint);

      console.log('[LearningDataService] Learning folders response:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data.folders.map((folder: any) => {
          // Extract CCTV IDs from subfolder names (e.g., "P1_B2_3" format)
          const cctvIds: string[] = [];
          let imageCount = 0;

          if (folder.subfolders) {
            folder.subfolders.forEach((subfolder: any) => {
              cctvIds.push(subfolder.name);
              imageCount += subfolder.file_count || 0;
            });
          }

          return {
            folder_name: folder.name,
            folder_path: folder.path,
            cctv_count: cctvIds.length,
            cctv_ids: cctvIds,
            image_count: imageCount,
            created_at: folder.created_at || new Date().toISOString(),
          };
        });
      }

      return [];
    } catch (error) {
      console.error('[LearningDataService] Failed to fetch learning folders:', error);
      throw error;
    }
  }

  /**
   * Get CCTV list for a specific learning folder
   */
  static async getCCTVList(projectId: string, folderPath: string): Promise<CCTVInfo[]> {
    try {
      console.log('[LearningDataService] Fetching CCTV list:', { projectId, folderPath });

      const endpoint = API_ENDPOINTS.FILE_STORAGE.LIST_FOLDERS(projectId, 'learning');
      const response = await api.get<NestedFolderListResponse>(endpoint);

      if (response.data.success && response.data.data) {
        const targetFolder = response.data.data.folders.find((f: any) => f.path === folderPath);

        if (targetFolder && targetFolder.subfolders) {
          const cctvList: CCTVInfo[] = targetFolder.subfolders.map((subfolder: any) => ({
            cctv_id: subfolder.name,
            folder_path: `${folderPath}/${subfolder.name}`,
            image_files: subfolder.files ? subfolder.files.map((f: any) => f.name) : [],
          }));

          console.log('[LearningDataService] CCTV list:', cctvList);
          return cctvList;
        }
      }

      return [];
    } catch (error) {
      console.error('[LearningDataService] Failed to fetch CCTV list:', error);
      throw error;
    }
  }

  /**
   * Get first image for a specific CCTV
   */
  static async getFirstImage(
    projectId: string,
    folderPath: string,
    cctvId: string,
    imageFileName: string
  ): Promise<string> {
    try {
      console.log('[LearningDataService] Fetching first image:', {
        projectId,
        folderPath,
        cctvId,
        imageFileName,
      });

      // Construct the file path: folderPath/cctvId/imageFileName
      const fullPath = `${folderPath}/${cctvId}/${imageFileName}`;
      const endpoint = API_ENDPOINTS.FILE_STORAGE.DOWNLOAD(projectId, 'learning', fullPath);

      const response = await api.get(endpoint, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(blob);

      console.log('[LearningDataService] Image loaded successfully');
      return imageUrl;
    } catch (error) {
      console.error('[LearningDataService] Failed to fetch image:', error);
      throw error;
    }
  }

  /**
   * Save edited image (overwrite original)
   */
  static async saveEditedImage(request: SaveEditedImageRequest): Promise<SaveEditedImageResponse> {
    try {
      console.log('[LearningDataService] Saving edited image:', {
        projectId: request.projectId,
        folderPath: request.folderPath,
        cctvId: request.cctvId,
        imageFile: request.imageFile,
      });

      const formData = new FormData();
      formData.append('files', request.imageData, request.imageFile);

      // Upload to the same path to overwrite
      const fullPath = `${request.folderPath}/${request.cctvId}`;
      const endpoint = API_ENDPOINTS.FILE_STORAGE.UPLOAD(request.projectId, 'learning');

      // Add folder path as query parameter to preserve structure
      const uploadUrl = `${endpoint}?folder_path=${encodeURIComponent(fullPath)}`;

      console.log('[LearningDataService] Upload request:', {
        url: uploadUrl,
        fileName: request.imageFile,
        fileSize: request.imageData.size,
        fileType: request.imageData.type,
        folderPath: fullPath,
      });

      const response = await api.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('[LearningDataService] Upload response:', response.status, response.data);

      console.log('[LearningDataService] Image saved successfully:', response.data);

      return {
        success: response.data.success,
        message: response.data.message || 'Image saved successfully',
        data: {
          saved_path: fullPath + '/' + request.imageFile,
          file_size: request.imageData.size,
        },
      };
    } catch (error: any) {
      console.error('[LearningDataService] Failed to save edited image:', {
        error,
        response: error?.response?.data,
        status: error?.response?.status,
        message: error?.message,
      });
      throw error;
    }
  }
}
