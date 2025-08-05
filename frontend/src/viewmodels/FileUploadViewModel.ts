import { FileType } from '../models/FileUpload';
import { FileUploadService } from '../services/FileUploadService';

export interface FileUploadState {
  selectedFile: File | null;
  selectedFiles?: File[];
  selectedFolderName?: string;
  uploading: boolean;
  uploadResult: {
    success: boolean;
    message: string;
    filePath?: string;
  } | null;
  uploadProgress: number;
}

export class FileUploadViewModel {
  private state: FileUploadState;
  private setState: React.Dispatch<React.SetStateAction<FileUploadState>>;
  private projectId: string;
  private fileType: FileType;

  constructor(
    projectId: string,
    fileType: FileType,
    state: FileUploadState,
    setState: React.Dispatch<React.SetStateAction<FileUploadState>>
  ) {
    this.projectId = projectId;
    this.fileType = fileType;
    this.state = state;
    this.setState = setState;
  }

  selectFile(file: File): void {
    this.setState(prev => ({ 
      ...prev, 
      selectedFile: file, 
      uploadResult: null 
    }));
  }

  async uploadFile(): Promise<void> {
    if (!this.state.selectedFile) return;

    try {
      this.setState(prev => ({ 
        ...prev, 
        uploading: true, 
        uploadResult: null,
        uploadProgress: 0
      }));

      const response = await FileUploadService.uploadFileWithProgress(
        this.state.selectedFile,
        this.projectId,
        this.fileType,
        (progress) => {
          this.setState(prev => ({ ...prev, uploadProgress: progress }));
        }
      );
      
      if (response.success) {
        this.setState(prev => ({
          ...prev,
          uploadResult: {
            success: true,
            message: response.message,
            filePath: response.file_path,
          },
          uploading: false,
        }));
      } else {
        this.setState(prev => ({
          ...prev,
          uploadResult: {
            success: false,
            message: response.message,
          },
          uploading: false,
        }));
      }
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      this.setState(prev => ({
        ...prev,
        uploadResult: {
          success: false,
          message: '파일 업로드 중 오류가 발생했습니다.',
        },
        uploading: false,
      }));
    }
  }

  getFileTypeLabel(): string {
    return this.fileType === 'learning' ? '학습 이미지' : '테스트 이미지';
  }

  getAcceptedExtensions(): string {
    return this.fileType === 'learning' 
      ? '.jpg,.jpeg,.png' 
      : '.jpg,.jpeg,.png';
  }

  get selectedFile(): File | null {
    return this.state.selectedFile;
  }

  get uploading(): boolean {
    return this.state.uploading;
  }

  get uploadResult(): { success: boolean; message: string; filePath?: string } | null {
    return this.state.uploadResult;
  }

  get uploadProgress(): number {
    return this.state.uploadProgress;
  }
} 