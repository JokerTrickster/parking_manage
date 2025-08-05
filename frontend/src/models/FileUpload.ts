export interface FileUploadResponse {
  success: boolean;
  message: string;
  file_path?: string;
}

export type FileType = 'learning' | 'test';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
} 