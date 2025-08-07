import { FileType, FileUploadResponse } from '../models/FileUpload';
import { FileUploadService, FolderInfo } from '../services/FileUploadService';

export interface FileUploadState {
  selectedFile: File | null;
  selectedFiles?: File[];
  selectedFolderName?: string;
  existingFolders: FolderInfo[];
  selectedExistingFolder: FolderInfo | null;
  uploading: boolean;
  uploadResult: {
    success: boolean;
    message: string;
    totalFiles?: number;
    successCount?: number;
    failed?: number;
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

  async loadExistingFolders(): Promise<void> {
    try {
      const folders = await FileUploadService.getExistingFolders(this.projectId, this.fileType);
      this.setState(prev => ({
        ...prev,
        existingFolders: folders
      }));
    } catch (error) {
      console.error('기존 폴더 로드 실패:', error);
    }
  }

  selectFile(file: File): void {
    this.setState(prev => ({ 
      ...prev, 
      selectedFile: file, 
      uploadResult: null,
      selectedExistingFolder: null
    }));
  }

  selectFiles(files: File[]): void {
    this.setState(prev => ({ 
      ...prev, 
      selectedFiles: files,
      selectedFile: files[0] || null,
      uploadResult: null,
      selectedExistingFolder: null
    }));
  }

  selectExistingFolder(folder: FolderInfo): void {
    this.setState(prev => ({
      ...prev,
      selectedExistingFolder: folder,
      selectedFile: null,
      selectedFiles: undefined,
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

      let response: FileUploadResponse;
      if (this.fileType === 'roi') {
        // ROI 파일은 단일 파일 업로드
        response = await FileUploadService.uploadFile(
          this.state.selectedFile,
          this.projectId,
          this.fileType
        );
      } else {
        // 다른 파일 타입은 기존 방식 사용
        response = await FileUploadService.uploadFileWithProgress(
          this.state.selectedFile,
          this.projectId,
          this.fileType,
          (progress) => {
            this.setState(prev => ({ ...prev, uploadProgress: progress }));
          }
        );
      }
      
      this.setState(prev => ({
        ...prev,
        uploadResult: {
          success: response.success,
          message: response.message,
          totalFiles: response.total_files,
          successCount: response.success_count,
          failed: response.failed,
          filePath: response.file_path,
        },
        uploading: false,
      }));

      // 업로드 성공 시 폴더 목록 새로고침
      if (response.success) {
        await this.loadExistingFolders();
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

  async uploadFolder(): Promise<void> {
    if (!this.state.selectedFiles || this.state.selectedFiles.length === 0) return;

    try {
      this.setState(prev => ({ 
        ...prev, 
        uploading: true, 
        uploadResult: null,
        uploadProgress: 0
      }));

      const response = await FileUploadService.uploadFolder(
        this.state.selectedFiles,
        this.projectId,
        this.fileType,
        (progress) => {
          this.setState(prev => ({ ...prev, uploadProgress: progress }));
        }
      );
      
      // 서버 응답 구조에 맞춰 처리
      const resultMessage = response.success 
        ? response.message 
        : '폴더 업로드 중 오류가 발생했습니다.';
      
      this.setState(prev => ({
        ...prev,
        uploadResult: {
          success: response.success,
          message: resultMessage,
          // 개수 정보를 메시지에 포함
          totalFiles: response.total_files,
          successCount: response.success_count,
          failed: response.failed
        },
        uploading: false,
      }));

      // 업로드 성공 시 폴더 목록 새로고침
      if (response.success) {
        await this.loadExistingFolders();
      }
    } catch (error) {
      console.error('폴더 업로드 실패:', error);
      this.setState(prev => ({
        ...prev,
        uploadResult: {
          success: false,
          message: '폴더 업로드 중 오류가 발생했습니다.',
        },
        uploading: false,
      }));
    }
  }

  getFileTypeLabel(): string {
    switch (this.fileType) {
      case 'learning':
        return '학습 이미지';
      case 'test':
        return '테스트 이미지';
      case 'roi':
        return 'ROI 파일';
      default:
        return '파일';
    }
  }

  getAcceptedExtensions(): string {
    switch (this.fileType) {
      case 'learning':
      case 'test':
        return '.jpg,.jpeg,.png';
      case 'roi':
        return '.json';
      default:
        return '';
    }
  }

  get selectedFile(): File | null {
    return this.state.selectedFile;
  }

  get selectedFiles(): File[] | undefined {
    return this.state.selectedFiles;
  }

  get selectedFolderName(): string | undefined {
    return this.state.selectedFolderName;
  }

  get existingFolders(): FolderInfo[] {
    return this.state.existingFolders;
  }

  get selectedExistingFolder(): FolderInfo | null {
    return this.state.selectedExistingFolder;
  }

  get uploading(): boolean {
    return this.state.uploading;
  }

  get uploadResult(): { 
    success: boolean; 
    message: string; 
    totalFiles?: number;
    successCount?: number;
    failed?: number;
    filePath?: string; 
  } | null {
    return this.state.uploadResult;
  }

  get uploadProgress(): number {
    return this.state.uploadProgress;
  }
} 