/**
 * File Repository ViewModel
 *
 * Manages state and business logic for the Project File Repository UI
 * Handles file listing, uploading, downloading, pagination, and filtering
 */

import { FileStorageService } from '../services/FileStorageService';
import {
  FileCategory,
  FileInfo,
  FileRepositoryState,
  FolderNode
} from '../models/FileStorage';

/**
 * FileRepositoryViewModel Class
 *
 * Responsibilities:
 * - Load files by category with pagination
 * - Upload files with progress tracking
 * - Download files (specific version and latest)
 * - Manage category switching
 * - Handle CCTV ID filtering (learning/test)
 * - Manage pagination state
 */
export class FileRepositoryViewModel {
  private state: FileRepositoryState;
  private setState: React.Dispatch<React.SetStateAction<FileRepositoryState>>;
  private projectId: string;

  constructor(
    projectId: string,
    state: FileRepositoryState,
    setState: React.Dispatch<React.SetStateAction<FileRepositoryState>>
  ) {
    this.projectId = projectId;
    this.state = state;
    this.setState = setState;
  }

  /**
   * Load files for current or specified category
   *
   * @param category - Optional category (uses current if not specified)
   * @param page - Optional page number (uses current if not specified)
   * @param cctvId - Optional CCTV ID filter (uses current if not specified)
   */
  async loadFiles(
    category?: FileCategory,
    page?: number,
    cctvId?: string
  ): Promise<void> {
    const targetCategory = category || this.state.currentCategory;
    const targetPage = page || this.state.pagination.page;
    const targetCctvId = cctvId !== undefined ? cctvId : this.state.selectedCctvId;

    try {
      console.log('[FileRepository] Loading files:', {
        projectId: this.projectId,
        category: targetCategory,
        page: targetPage,
        cctvId: targetCctvId,
      });

      this.setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await FileStorageService.listFiles(
        this.projectId,
        targetCategory,
        targetPage,
        this.state.pagination.pageSize,
        targetCctvId
      );

      this.setState(prev => ({
        ...prev,
        files: response.data.files,
        pagination: {
          ...prev.pagination,
          page: response.data.pagination.page,
          pageSize: response.data.pagination.page_size,
          totalPages: response.data.pagination.total_pages,
          totalCount: response.data.total_count,
        },
        loading: false,
      }));

      console.log('[FileRepository] Files loaded:', {
        count: response.data.files.length,
        totalCount: response.data.total_count,
      });
    } catch (error) {
      console.error('[FileRepository] Load files failed:', error);
      this.setState(prev => ({
        ...prev,
        loading: false,
        error: '파일 목록을 불러오는데 실패했습니다.',
      }));
    }
  }

  /**
   * Upload files with progress tracking
   *
   * @param files - Array of files to upload
   */
  async uploadFiles(files: File[]): Promise<void> {
    try {
      console.log('[FileRepository] Uploading files:', {
        projectId: this.projectId,
        category: this.state.currentCategory,
        fileCount: files.length,
      });

      this.setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        uploadProgress: 0,
      }));

      const response = await FileStorageService.uploadFiles(
        this.projectId,
        this.state.currentCategory,
        files,
        (progress) => {
          this.setState(prev => ({ ...prev, uploadProgress: progress }));
        }
      );

      if (response.success) {
        console.log('[FileRepository] Upload successful:', {
          successCount: response.data.success_count,
          failedCount: response.data.failed_count,
        });

        // Reload current view after successful upload
        if (this.supportsFolderView) {
          // Refresh folder view
          await this.loadFolders();
        } else {
          // Reload files
          await this.loadFiles();
        }
      } else {
        throw new Error(response.message);
      }

      this.setState(prev => ({ ...prev, loading: false, uploadProgress: 0 }));
    } catch (error) {
      console.error('[FileRepository] Upload failed:', error);
      this.setState(prev => ({
        ...prev,
        loading: false,
        uploadProgress: 0,
        error: '파일 업로드에 실패했습니다.',
      }));
    }
  }

  /**
   * Download specific file
   *
   * @param filename - Full filename with version
   * @param originalName - Original filename for browser download
   */
  async downloadFile(filename: string, originalName: string): Promise<void> {
    try {
      console.log('[FileRepository] Downloading file:', { filename, originalName });

      const blob = await FileStorageService.downloadFile(
        this.projectId,
        this.state.currentCategory,
        filename
      );

      FileStorageService.triggerBrowserDownload(blob, originalName);
      console.log('[FileRepository] Download completed');
    } catch (error) {
      console.error('[FileRepository] Download failed:', error);
      this.setState(prev => ({
        ...prev,
        error: '파일 다운로드에 실패했습니다.',
      }));
    }
  }

  /**
   * Download latest version of a file
   *
   * @param originalName - Original filename without version
   */
  async downloadLatest(originalName: string): Promise<void> {
    try {
      console.log('[FileRepository] Downloading latest version:', { originalName });

      const blob = await FileStorageService.downloadLatest(
        this.projectId,
        this.state.currentCategory,
        originalName
      );

      FileStorageService.triggerBrowserDownload(blob, originalName);
      console.log('[FileRepository] Latest version downloaded');
    } catch (error) {
      console.error('[FileRepository] Download latest failed:', error);
      this.setState(prev => ({
        ...prev,
        error: '최신 버전 다운로드에 실패했습니다.',
      }));
    }
  }

  /**
   * Load folders for learning/test categories (with nested folder support)
   */
  async loadFolders(path?: string): Promise<void> {
    if (!this.supportsFolderView) {
      console.warn('[FileRepository] Folder view not supported for category:', this.state.currentCategory);
      return;
    }

    try {
      const targetPath = path !== undefined ? path : this.state.currentPath;

      console.log('[FileRepository] Loading folders:', {
        projectId: this.projectId,
        category: this.state.currentCategory,
        path: targetPath,
      });

      this.setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await FileStorageService.listFolders(
        this.projectId,
        this.state.currentCategory,
        targetPath
      );

      // Defensive null checks for API response
      const items = response?.data?.items || [];
      const currentPath = response?.data?.currentPath || '';

      this.setState(prev => ({
        ...prev,
        folders: items,
        currentPath: currentPath,
        loading: false,
        viewMode: 'folders',
      }));

      console.log('[FileRepository] Folders loaded:', {
        count: items.length,
        currentPath: currentPath,
      });
    } catch (error) {
      console.error('[FileRepository] Load folders failed:', error);
      this.setState(prev => ({
        ...prev,
        loading: false,
        error: '폴더 목록을 불러오는데 실패했습니다.',
      }));
    }
  }

  /**
   * Select a folder/file item
   * If folder: navigate into it
   * If file: show file details (future expansion)
   */
  async selectFolder(item: FolderNode): Promise<void> {
    console.log('[FileRepository] Selecting item:', item.name, 'isFolder:', item.isFolder);

    if (item.isFolder) {
      // Navigate into folder
      await this.loadFolders(item.path);
    } else {
      // File clicked - could show file preview or download (future feature)
      console.log('[FileRepository] File clicked:', item.name);
    }
  }

  /**
   * Go back to parent folder
   */
  backToFolders(): void {
    console.log('[FileRepository] Back to parent folder');

    const currentPath = this.state.currentPath;
    if (!currentPath) {
      // Already at root
      return;
    }

    // Calculate parent path
    const pathParts = currentPath.split('/');
    pathParts.pop(); // Remove last segment
    const parentPath = pathParts.join('/');

    // Reload folders at parent path
    this.loadFolders(parentPath);
  }

  /**
   * Change category and reload files
   *
   * @param category - New category to switch to
   */
  async setCategory(category: FileCategory): Promise<void> {
    console.log('[FileRepository] Changing category:', category);

    const isLearningOrTest = category === 'learning' || category === 'test';

    this.setState(prev => ({
      ...prev,
      currentCategory: category,
      pagination: { ...prev.pagination, page: 1 }, // Reset to page 1
      selectedCctvId: undefined, // Clear CCTV filter
      selectedFolder: null, // Clear folder selection
      currentPath: '', // Reset to root path
      files: [], // Clear files immediately for better UX
      folders: [], // Clear folders
      viewMode: isLearningOrTest ? 'folders' : 'files',
    }));

    // Load folders for learning/test, files for others
    if (isLearningOrTest) {
      await this.loadFolders(''); // Start from root
    } else {
      await this.loadFiles(category, 1);
    }
  }

  /**
   * Change page
   *
   * @param page - Page number to navigate to
   */
  async changePage(page: number): Promise<void> {
    console.log('[FileRepository] Changing page:', page);

    if (page < 1 || page > this.state.pagination.totalPages) {
      console.warn('[FileRepository] Invalid page number:', page);
      return;
    }

    await this.loadFiles(undefined, page);
  }

  /**
   * Set CCTV ID filter (learning/test categories only)
   *
   * @param cctvId - CCTV ID to filter by (undefined to clear filter)
   */
  async setCctvId(cctvId: string | undefined): Promise<void> {
    console.log('[FileRepository] Setting CCTV ID filter:', cctvId);

    this.setState(prev => ({
      ...prev,
      selectedCctvId: cctvId,
      pagination: { ...prev.pagination, page: 1 }, // Reset to page 1
    }));

    await this.loadFiles(undefined, 1, cctvId);
  }

  /**
   * Delete file
   *
   * @param filename - Full filename with version to delete
   */
  async deleteFile(filename: string): Promise<void> {
    try {
      console.log('[FileRepository] Deleting file:', { filename });

      this.setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await FileStorageService.deleteFile(
        this.projectId,
        this.state.currentCategory,
        filename
      );

      if (response.success) {
        console.log('[FileRepository] Delete successful');

        // Reload files after successful deletion
        await this.loadFiles();
      } else {
        throw new Error(response.message);
      }

      this.setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('[FileRepository] Delete failed:', error);
      this.setState(prev => ({
        ...prev,
        loading: false,
        error: '파일 삭제에 실패했습니다.',
      }));
    }
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.setState(prev => ({ ...prev, error: null }));
  }

  /**
   * Refresh current view (reload files)
   */
  async refresh(): Promise<void> {
    console.log('[FileRepository] Refreshing files');
    await this.loadFiles();
  }

  // Getters
  get currentCategory(): FileCategory {
    return this.state.currentCategory;
  }

  get files(): FileInfo[] {
    return this.state.files;
  }

  get loading(): boolean {
    return this.state.loading;
  }

  get error(): string | null {
    return this.state.error;
  }

  get pagination() {
    return this.state.pagination;
  }

  get selectedCctvId(): string | undefined {
    return this.state.selectedCctvId;
  }

  get uploadProgress(): number {
    return this.state.uploadProgress;
  }

  /**
   * Check if current category supports versioning
   */
  get isVersionedCategory(): boolean {
    return ['map', 'cad', 'roi'].includes(this.state.currentCategory);
  }

  /**
   * Check if current category supports CCTV ID filtering
   */
  get supportsCctvFilter(): boolean {
    return ['learning', 'test'].includes(this.state.currentCategory);
  }

  /**
   * Check if current category supports folder view
   */
  get supportsFolderView(): boolean {
    return ['learning', 'test'].includes(this.state.currentCategory);
  }

  get folders(): FolderNode[] {
    return this.state.folders;
  }

  get selectedFolder(): FolderNode | null {
    return this.state.selectedFolder;
  }

  get viewMode(): 'folders' | 'files' {
    return this.state.viewMode;
  }
}
