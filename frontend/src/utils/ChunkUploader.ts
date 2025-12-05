/**
 * Chunk Uploader Utility
 *
 * Handles large file uploads by splitting them into chunks
 * Provides file validation and progress tracking
 */

import { FileStorageService } from '../services/FileStorageService';
import { FileCategory, UploadResponse, ChunkUploadOptions, FileValidationResult } from '../models/FileStorage';

/**
 * ChunkUploader Class
 *
 * Provides methods for:
 * - Chunk-based file upload with progress tracking
 * - File validation (size, type)
 * - Optimal chunk size calculation
 */
export class ChunkUploader {
  // Default chunk size: 5MB
  private static readonly DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

  // Maximum file size: 10GB (matches backend limit)
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024;

  /**
   * Upload large file with chunk-based progress tracking
   *
   * Note: Current backend implementation uploads the full file at once.
   * This implementation tracks progress in chunks for future enhancement
   * when backend supports true chunked upload with reassembly.
   *
   * @param options - Chunk upload configuration
   * @returns Upload response
   */
  static async uploadWithChunks(options: ChunkUploadOptions): Promise<UploadResponse> {
    const {
      projectId,
      category,
      file,
      chunkSize = this.DEFAULT_CHUNK_SIZE,
      onProgress,
      onChunkComplete,
    } = options;

    // Calculate total chunks
    const totalChunks = Math.ceil(file.size / chunkSize);

    console.log('[ChunkUploader] Starting upload:', {
      filename: file.name,
      size: file.size,
      chunkSize,
      totalChunks,
    });

    try {
      // Upload entire file with progress tracking
      // Future enhancement: implement true chunk upload when backend supports it
      const response = await FileStorageService.uploadFiles(
        projectId,
        category,
        [file],
        (progress) => {
          // Map overall progress to chunk progress
          const currentChunk = Math.floor((progress / 100) * totalChunks);

          if (onChunkComplete && currentChunk > 0 && currentChunk <= totalChunks) {
            onChunkComplete(currentChunk, totalChunks);
          }

          if (onProgress) {
            onProgress(progress);
          }
        }
      );

      console.log('[ChunkUploader] Upload completed:', response);
      return response;
    } catch (error) {
      console.error('[ChunkUploader] Upload failed:', error);
      throw error;
    }
  }

  /**
   * Calculate optimal chunk size based on file size
   *
   * Strategy:
   * - Small files (<10MB): 1MB chunks
   * - Medium files (10-100MB): 5MB chunks
   * - Large files (>100MB): 10MB chunks
   *
   * @param fileSize - File size in bytes
   * @returns Optimal chunk size in bytes
   */
  static calculateChunkSize(fileSize: number): number {
    if (fileSize < 10 * 1024 * 1024) {
      return 1 * 1024 * 1024; // 1MB for small files
    }
    if (fileSize < 100 * 1024 * 1024) {
      return 5 * 1024 * 1024; // 5MB for medium files
    }
    return 10 * 1024 * 1024; // 10MB for large files
  }

  /**
   * Validate file before upload
   *
   * Checks:
   * - File size within limit (100MB)
   * - File type matches category requirements
   *
   * @param file - File to validate
   * @param category - Target category
   * @returns Validation result with error message if invalid
   */
  static validateFile(file: File, category: FileCategory): FileValidationResult {
    console.log('[ChunkUploader] Validating file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      category
    });

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      console.log('[ChunkUploader] File too large:', file.name, file.size);
      return {
        valid: false,
        error: `파일 크기는 ${FileStorageService.formatFileSize(this.MAX_FILE_SIZE)}를 초과할 수 없습니다.`,
      };
    }

    // Skip size 0 check for images - browser may not load file size correctly for large folder uploads
    // if (file.size === 0) {
    //   console.log('[ChunkUploader] Empty file:', file.name);
    //   return {
    //     valid: false,
    //     error: '파일이 비어있습니다.',
    //   };
    // }

    // Check file type by category
    const validExtensions: Record<FileCategory, string[]> = {
      map: ['.json'],
      cad: ['.dxf', '.dwg', '.json'],
      roi: ['.json'],
      learning: ['.jpg', '.jpeg', '.png'],
      test: ['.jpg', '.jpeg', '.png'],
    };

    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    const allowedExts = validExtensions[category] || [];

    console.log('[ChunkUploader] Extension check:', {
      fileName: file.name,
      fileExt,
      allowedExts,
      isValid: allowedExts.includes(fileExt)
    });

    if (!allowedExts.includes(fileExt)) {
      console.log('[ChunkUploader] Invalid extension:', file.name, fileExt);
      return {
        valid: false,
        error: `허용되지 않는 파일 형식입니다. (허용: ${allowedExts.join(', ')})`,
      };
    }

    console.log('[ChunkUploader] File valid:', file.name);
    return { valid: true };
  }

  /**
   * Validate multiple files
   *
   * @param files - Array of files to validate
   * @param category - Target category
   * @returns Object with valid files and error messages
   */
  static validateFiles(
    files: File[],
    category: FileCategory
  ): { valid: File[]; invalid: Array<{ file: File; error: string }> } {
    const valid: File[] = [];
    const invalid: Array<{ file: File; error: string }> = [];

    files.forEach(file => {
      const validation = this.validateFile(file, category);
      if (validation.valid) {
        valid.push(file);
      } else {
        invalid.push({ file, error: validation.error || '알 수 없는 오류' });
      }
    });

    return { valid, invalid };
  }

  /**
   * Sanitize filename for safe storage
   * Removes special characters and replaces spaces
   *
   * @param filename - Original filename
   * @returns Sanitized filename
   */
  static sanitizeFilename(filename: string): string {
    // Replace spaces with underscores
    let sanitized = filename.replace(/\s+/g, '_');

    // Remove special characters except dots, underscores, and hyphens
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '');

    // Ensure filename is not empty
    if (!sanitized) {
      sanitized = 'file';
    }

    return sanitized;
  }

  /**
   * Get accepted file extensions for a category
   *
   * @param category - File category
   * @returns Comma-separated list of extensions (e.g., ".json,.dxf")
   */
  static getAcceptedExtensions(category: FileCategory): string {
    const extensions: Record<FileCategory, string> = {
      map: '.json',
      cad: '.dxf,.dwg,.json',
      roi: '.json',
      learning: '.jpg,.jpeg,.png',
      test: '.jpg,.jpeg,.png',
    };

    return extensions[category] || '*';
  }

  /**
   * Get user-friendly category name
   *
   * @param category - File category
   * @returns Korean category name
   */
  static getCategoryLabel(category: FileCategory): string {
    const labels: Record<FileCategory, string> = {
      map: '맵 파일',
      cad: 'CAD 도면',
      roi: 'ROI 파일',
      learning: '학습 이미지',
      test: '테스트 이미지',
    };

    return labels[category] || category;
  }
}
