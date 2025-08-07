export interface FileUploadResponse {
  success: boolean;
  message: string;
  total_files?: number;
  success_count?: number;
  failed?: number;
  file_path?: string; // 기존 호환성을 위해 유지
}

export type FileType = 'learning' | 'test' | 'roi';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
} 