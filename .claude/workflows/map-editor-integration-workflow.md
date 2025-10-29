# Map Editor Integration & Project File Repository - Implementation Workflow

## Overview

This workflow provides a comprehensive, step-by-step implementation plan for integrating the map editor auto-save feature and building the project file repository UI. The workflow is organized into 6 phases with detailed tasks, dependencies, and validation criteria.

**Total Estimated Time:** 11-16 days
**PRD Reference:** `.claude/prds/map-editor-integration.md`

---

## Phase 1: Foundation (2-3 days)

### Objective
Establish the foundational architecture, models, services, and utilities required for file storage integration.

### Tasks

#### 1.1 Define TypeScript Models and Types
**File:** `src/models/FileStorage.ts`

**Dependencies:** None
**Estimated Time:** 1-2 hours

**Implementation:**
```typescript
// Export file category type
export type FileCategory = 'map' | 'cad' | 'roi' | 'learning' | 'test';

// File information structure matching backend entity
export interface FileInfo {
  filename: string;           // Actual filename with version
  original_name: string;      // Original filename without version
  version: string;            // Version timestamp
  size_bytes: number;         // File size in bytes
  upload_date: string;        // ISO 8601 format
  file_type: string;          // MIME type
  path: string;               // Server path
  cctv_id?: string;           // CCTV ID (learning/test only)
}

// Upload response structure
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

// File list response structure
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

// Auto-upload response structure
export interface AutoUploadResponse {
  success: boolean;
  message: string;
  data: {
    project_id: string;
    filename: string;
  };
}

// File repository state interface
export interface FileRepositoryState {
  currentCategory: FileCategory;
  files: FileInfo[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
  selectedCctvId?: string;
  uploadProgress: number;
}
```

**Validation:**
- [ ] All interfaces match backend API response structures
- [ ] TypeScript compilation successful with no errors
- [ ] Exported types accessible from other modules

---

#### 1.2 Add API Endpoints Configuration
**File:** `src/config/api.ts`

**Dependencies:** Task 1.1
**Estimated Time:** 30-45 minutes

**Implementation:**
Add new endpoint configuration to existing `API_ENDPOINTS` object:

```typescript
// File Storage API v0.1 Endpoints
FILE_STORAGE: {
  // Auto-upload for map editor
  AUTO_UPLOAD_MAP: (projectId: string) =>
    `/v0.1/filestorage/${projectId}/map/auto-upload`,

  // Upload files
  UPLOAD: (projectId: string, category: FileCategory) =>
    `/v0.1/filestorage/${projectId}/${category}/upload`,

  // List files with pagination and filters
  LIST: (projectId: string, category: FileCategory, params?: {
    page?: number;
    pageSize?: number;
    cctvId?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params?.cctvId) queryParams.append('cctv_id', params.cctvId);
    const query = queryParams.toString();
    return `/v0.1/filestorage/${projectId}/${category}/list${query ? '?' + query : ''}`;
  },

  // Download specific file
  DOWNLOAD: (projectId: string, category: FileCategory, filename: string) =>
    `/v0.1/filestorage/${projectId}/${category}/download/${filename}`,

  // Download latest version
  DOWNLOAD_LATEST: (projectId: string, category: FileCategory, originalName: string) =>
    `/v0.1/filestorage/${projectId}/${category}/latest?original_name=${originalName}`,
}
```

**Validation:**
- [ ] Endpoints match backend API documentation
- [ ] Query parameter construction works correctly
- [ ] Import `FileCategory` type from models
- [ ] No TypeScript errors

---

#### 1.3 Implement FileStorageService
**File:** `src/services/FileStorageService.ts`

**Dependencies:** Tasks 1.1, 1.2
**Estimated Time:** 3-4 hours

**Implementation:**
Create service class following existing patterns (reference: `FileUploadService.ts`):

```typescript
import axios from 'axios';
import {
  FileCategory,
  FileInfo,
  UploadResponse,
  FileListResponse,
  AutoUploadResponse
} from '../models/FileStorage';
import { apiConfig, API_ENDPOINTS } from '../config/api';

const axiosConfig = {
  baseURL: apiConfig.BASE_URL,
  timeout: 300000, // 5 minutes for large files
};

const api = axios.create(axiosConfig);

export class FileStorageService {
  // Auto-upload map file (fire-and-forget)
  static async autoUploadMap(
    projectId: string,
    file: File
  ): Promise<AutoUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = API_ENDPOINTS.FILE_STORAGE.AUTO_UPLOAD_MAP(projectId);
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 2 minutes
      });

      return response.data;
    } catch (error) {
      console.error('[FileStorageService] Auto-upload failed:', error);
      throw error;
    }
  }

  // Upload files with optional progress callback
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
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('[FileStorageService] Upload failed:', error);
      throw error;
    }
  }

  // List files with pagination
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
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('[FileStorageService] List files failed:', error);
      throw error;
    }
  }

  // Download file
  static async downloadFile(
    projectId: string,
    category: FileCategory,
    filename: string
  ): Promise<Blob> {
    try {
      const endpoint = API_ENDPOINTS.FILE_STORAGE.DOWNLOAD(projectId, category, filename);
      const response = await api.get(endpoint, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('[FileStorageService] Download failed:', error);
      throw error;
    }
  }

  // Download latest version
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
      const response = await api.get(endpoint, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('[FileStorageService] Download latest failed:', error);
      throw error;
    }
  }

  // Trigger browser download
  static triggerBrowserDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
```

**Validation:**
- [ ] All methods properly typed with interfaces
- [ ] Error handling with console logging
- [ ] Follows existing service patterns
- [ ] FormData construction matches backend expectations
- [ ] TypeScript compilation successful

---

#### 1.4 Implement Chunk Upload Utility
**File:** `src/utils/ChunkUploader.ts`

**Dependencies:** Tasks 1.1, 1.3
**Estimated Time:** 2-3 hours

**Implementation:**
```typescript
import { FileStorageService } from '../services/FileStorageService';
import { FileCategory, UploadResponse } from '../models/FileStorage';

export interface ChunkUploadOptions {
  projectId: string;
  category: FileCategory;
  file: File;
  chunkSize?: number; // Default 5MB
  onProgress?: (progress: number) => void;
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
}

export class ChunkUploader {
  private static readonly DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Upload large file in chunks
   * Note: Backend currently doesn't support chunk assembly,
   * so this implementation uploads the full file but tracks progress in chunks
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

    const totalChunks = Math.ceil(file.size / chunkSize);

    // For now, upload entire file with progress tracking
    // Future enhancement: implement true chunk upload when backend supports it
    try {
      const response = await FileStorageService.uploadFiles(
        projectId,
        category,
        [file],
        (progress) => {
          // Map overall progress to chunk progress
          const currentChunk = Math.floor((progress / 100) * totalChunks);
          if (onChunkComplete && currentChunk > 0) {
            onChunkComplete(currentChunk, totalChunks);
          }
          if (onProgress) {
            onProgress(progress);
          }
        }
      );

      return response;
    } catch (error) {
      console.error('[ChunkUploader] Upload failed:', error);
      throw error;
    }
  }

  /**
   * Calculate optimal chunk size based on file size
   */
  static calculateChunkSize(fileSize: number): number {
    if (fileSize < 10 * 1024 * 1024) return 1 * 1024 * 1024; // 1MB for small files
    if (fileSize < 100 * 1024 * 1024) return 5 * 1024 * 1024; // 5MB for medium files
    return 10 * 1024 * 1024; // 10MB for large files
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File, category: FileCategory): { valid: boolean; error?: string } {
    // File size limit: 100MB
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: '파일 크기는 100MB를 초과할 수 없습니다.' };
    }

    // File type validation
    const validExtensions: Record<FileCategory, string[]> = {
      map: ['.json'],
      cad: ['.dxf', '.dwg', '.json'],
      roi: ['.json'],
      learning: ['.jpg', '.jpeg', '.png'],
      test: ['.jpg', '.jpeg', '.png'],
    };

    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions[category]?.includes(fileExt)) {
      return {
        valid: false,
        error: `허용되지 않는 파일 형식입니다. (허용: ${validExtensions[category]?.join(', ')})`
      };
    }

    return { valid: true };
  }
}
```

**Validation:**
- [ ] Chunk size calculation logic correct
- [ ] File validation covers all categories
- [ ] Progress tracking works properly
- [ ] Error handling comprehensive
- [ ] TypeScript compilation successful

---

### Phase 1 Completion Checklist

- [ ] All TypeScript models defined and exported
- [ ] API endpoints configured correctly
- [ ] FileStorageService implements all required methods
- [ ] ChunkUploader utility functional
- [ ] No TypeScript compilation errors
- [ ] All files follow existing code style
- [ ] Console logging in place for debugging

**Review Points:**
- Code follows MVVM pattern
- Error handling is consistent
- Types are properly imported/exported
- Matches existing service patterns (FileUploadService)

---

## Phase 2: Map Editor Integration (1-2 days)

### Objective
Integrate auto-save functionality into the existing map editor with loading indicators and proper error handling.

### Prerequisites
- Phase 1 complete
- Map editor component identified
- Project selection state accessible

### Tasks

#### 2.1 Create MapEditorAutoSaveViewModel
**File:** `src/viewmodels/MapEditorAutoSaveViewModel.ts`

**Dependencies:** Phase 1 complete
**Estimated Time:** 2-3 hours

**Implementation:**
```typescript
import { FileStorageService } from '../services/FileStorageService';

export interface AutoSaveState {
  saving: boolean;
  success: boolean | null;
  error: string | null;
}

export class MapEditorAutoSaveViewModel {
  private state: AutoSaveState;
  private setState: React.Dispatch<React.SetStateAction<AutoSaveState>>;

  constructor(
    state: AutoSaveState,
    setState: React.Dispatch<React.SetStateAction<AutoSaveState>>
  ) {
    this.state = state;
    this.setState = setState;
  }

  /**
   * Auto-save map data to server
   * Fires and forgets - doesn't block user interaction
   */
  async autoSave(projectId: string, mapData: object): Promise<void> {
    try {
      this.setState({
        saving: true,
        success: null,
        error: null,
      });

      // Convert map data to JSON blob
      const jsonString = JSON.stringify(mapData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], 'parking_map.json', { type: 'application/json' });

      // Call auto-upload API (202 Accepted response)
      await FileStorageService.autoUploadMap(projectId, file);

      // Success - mark as saved
      this.setState({
        saving: false,
        success: true,
        error: null,
      });

      // Auto-hide success message after 2 seconds
      setTimeout(() => {
        this.setState(prev => ({
          ...prev,
          success: null,
        }));
      }, 2000);

    } catch (error) {
      console.error('[MapEditorAutoSave] Failed:', error);
      // Don't show error to user - just log it
      // Backend will log the actual upload failure
      this.setState({
        saving: false,
        success: false,
        error: null, // Don't expose error to user
      });
    }
  }

  /**
   * Download map data locally (existing functionality)
   */
  downloadLocal(mapData: object, filename: string = 'parking_map.json'): void {
    try {
      const jsonString = JSON.stringify(mapData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[MapEditorAutoSave] Local download failed:', error);
      this.setState({
        saving: false,
        success: false,
        error: '로컬 다운로드에 실패했습니다.',
      });
    }
  }

  /**
   * Reset state
   */
  resetState(): void {
    this.setState({
      saving: false,
      success: null,
      error: null,
    });
  }

  // Getters
  get saving(): boolean {
    return this.state.saving;
  }

  get success(): boolean | null {
    return this.state.success;
  }

  get error(): string | null {
    return this.state.error;
  }
}
```

**Validation:**
- [ ] ViewModel follows existing patterns
- [ ] State management uses React.Dispatch pattern
- [ ] Auto-save is non-blocking (fire-and-forget)
- [ ] Local download preserved
- [ ] Error handling doesn't expose backend errors to user

---

#### 2.2 Create AutoSaveIndicator Component
**File:** `src/components/MapEditor/AutoSaveIndicator.tsx`

**Dependencies:** Task 2.1
**Estimated Time:** 1-2 hours

**Implementation:**
```typescript
import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AutoSaveState } from '../../viewmodels/MapEditorAutoSaveViewModel';

interface AutoSaveIndicatorProps {
  state: AutoSaveState;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ state }) => {
  if (!state.saving && !state.success) {
    return null; // Don't show anything when idle
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: '4px 12px',
        borderRadius: 1,
        backgroundColor: state.success ? '#e8f5e9' : '#fff3e0',
      }}
    >
      {state.saving && (
        <>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            저장 중...
          </Typography>
        </>
      )}
      {state.success && (
        <>
          <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: '#4caf50' }}>
            저장 완료
          </Typography>
        </>
      )}
    </Box>
  );
};
```

**Validation:**
- [ ] Component renders correctly for each state
- [ ] Material-UI components used properly
- [ ] Styling matches existing design system
- [ ] Auto-hides after success (handled by ViewModel)

---

#### 2.3 Integrate Auto-Save into Map Editor
**File:** Existing map editor component (to be identified)

**Dependencies:** Tasks 2.1, 2.2
**Estimated Time:** 2-3 hours

**Implementation Steps:**
1. Locate the map editor export/save button handler
2. Add MapEditorAutoSaveViewModel initialization
3. Modify export handler to call both local download AND auto-save
4. Add AutoSaveIndicator component to UI

**Pseudocode:**
```typescript
// In map editor component

const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
  saving: false,
  success: null,
  error: null,
});

const autoSaveViewModel = useMemo(
  () => new MapEditorAutoSaveViewModel(autoSaveState, setAutoSaveState),
  [autoSaveState]
);

const handleExport = async () => {
  const mapData = getMapData(); // Get current map data

  // Local download (existing behavior)
  autoSaveViewModel.downloadLocal(mapData);

  // Auto-save to server (new behavior)
  if (currentProjectId) {
    await autoSaveViewModel.autoSave(currentProjectId, mapData);
  }
};

// In JSX
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
  <Button onClick={handleExport}>내보내기</Button>
  <AutoSaveIndicator state={autoSaveState} />
</Box>
```

**Validation:**
- [ ] Export button triggers both local download and server upload
- [ ] Loading indicator shows during save
- [ ] Success indicator shows and auto-hides
- [ ] Errors logged to console but not shown to user
- [ ] UI remains responsive during save

---

### Phase 2 Completion Checklist

- [ ] MapEditorAutoSaveViewModel functional
- [ ] AutoSaveIndicator renders correctly
- [ ] Map editor integrated with auto-save
- [ ] Local download still works
- [ ] Server upload happens in background
- [ ] No UI blocking during save
- [ ] Success feedback visible
- [ ] Error handling proper

**Testing:**
- Export map → verify local download
- Export map → verify server upload (check backend logs)
- Export map → verify loading indicator
- Export map → verify success message
- Test with large map files (>10MB)

---

## Phase 3: File Repository UI (3-4 days)

### Objective
Build the Project File Repository page with category tabs, file list table, and pagination.

### Prerequisites
- Phase 1 complete
- Project selection mechanism understood

### Tasks

#### 3.1 Create FileRepositoryViewModel
**File:** `src/viewmodels/FileRepositoryViewModel.ts`

**Dependencies:** Phase 1 complete
**Estimated Time:** 3-4 hours

**Implementation:**
```typescript
import { useState, useCallback } from 'react';
import { FileStorageService } from '../services/FileStorageService';
import {
  FileCategory,
  FileInfo,
  FileRepositoryState
} from '../models/FileStorage';

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
   * Load files for current category
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
   */
  async uploadFiles(files: File[]): Promise<void> {
    try {
      this.setState(prev => ({ ...prev, loading: true, error: null, uploadProgress: 0 }));

      const response = await FileStorageService.uploadFiles(
        this.projectId,
        this.state.currentCategory,
        files,
        (progress) => {
          this.setState(prev => ({ ...prev, uploadProgress: progress }));
        }
      );

      if (response.success) {
        // Reload files after successful upload
        await this.loadFiles();
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
   * Download file
   */
  async downloadFile(filename: string, originalName: string): Promise<void> {
    try {
      const blob = await FileStorageService.downloadFile(
        this.projectId,
        this.state.currentCategory,
        filename
      );
      FileStorageService.triggerBrowserDownload(blob, originalName);
    } catch (error) {
      console.error('[FileRepository] Download failed:', error);
      this.setState(prev => ({
        ...prev,
        error: '파일 다운로드에 실패했습니다.',
      }));
    }
  }

  /**
   * Download latest version
   */
  async downloadLatest(originalName: string): Promise<void> {
    try {
      const blob = await FileStorageService.downloadLatest(
        this.projectId,
        this.state.currentCategory,
        originalName
      );
      FileStorageService.triggerBrowserDownload(blob, originalName);
    } catch (error) {
      console.error('[FileRepository] Download latest failed:', error);
      this.setState(prev => ({
        ...prev,
        error: '최신 버전 다운로드에 실패했습니다.',
      }));
    }
  }

  /**
   * Change category and reload files
   */
  async setCategory(category: FileCategory): Promise<void> {
    this.setState(prev => ({
      ...prev,
      currentCategory: category,
      pagination: { ...prev.pagination, page: 1 }, // Reset to page 1
      selectedCctvId: undefined, // Clear CCTV filter
    }));
    await this.loadFiles(category, 1);
  }

  /**
   * Change page
   */
  async changePage(page: number): Promise<void> {
    await this.loadFiles(undefined, page);
  }

  /**
   * Set CCTV ID filter (learning/test only)
   */
  async setCctvId(cctvId: string | undefined): Promise<void> {
    this.setState(prev => ({
      ...prev,
      selectedCctvId: cctvId,
      pagination: { ...prev.pagination, page: 1 }, // Reset to page 1
    }));
    await this.loadFiles(undefined, 1, cctvId);
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
}
```

**Validation:**
- [ ] ViewModel follows existing patterns (FileUploadViewModel)
- [ ] All async operations properly handled
- [ ] State updates immutable
- [ ] Error handling comprehensive
- [ ] Category switching resets pagination

---

#### 3.2 Create ProjectFileRepositoryView Page
**File:** `src/views/ProjectFileRepositoryView.tsx`

**Dependencies:** Task 3.1
**Estimated Time:** 2-3 hours

**Implementation:**
```typescript
import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { FileRepositoryViewModel } from '../viewmodels/FileRepositoryViewModel';
import { FileCategory, FileRepositoryState } from '../models/FileStorage';
import { FileListTable } from '../components/FileList/FileListTable';
import { DragDropZone } from '../components/FileUpload/DragDropZone';
import { Pagination } from '../components/FileList/Pagination';

interface ProjectFileRepositoryViewProps {
  projectId: string;
  projectName: string;
}

export const ProjectFileRepositoryView: React.FC<ProjectFileRepositoryViewProps> = ({
  projectId,
  projectName,
}) => {
  const [state, setState] = useState<FileRepositoryState>({
    currentCategory: 'map',
    files: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 100,
      totalPages: 1,
      totalCount: 0,
    },
    uploadProgress: 0,
  });

  const viewModel = useMemo(
    () => new FileRepositoryViewModel(projectId, state, setState),
    [projectId, state]
  );

  // Load files on mount and category change
  useEffect(() => {
    viewModel.loadFiles();
  }, [state.currentCategory]);

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: FileCategory) => {
    viewModel.setCategory(newValue);
  };

  const handleFilesSelected = async (files: File[]) => {
    await viewModel.uploadFiles(files);
  };

  const handlePageChange = (page: number) => {
    viewModel.changePage(page);
  };

  const handleDownload = (filename: string, originalName: string) => {
    viewModel.downloadFile(filename, originalName);
  };

  const handleDownloadLatest = (originalName: string) => {
    viewModel.downloadLatest(originalName);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            프로젝트 파일 보관함
          </Typography>
          <Typography variant="body2" color="text.secondary">
            현재 프로젝트: <strong>{projectName}</strong>
          </Typography>
        </Box>

        {/* Category Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={state.currentCategory} onChange={handleCategoryChange}>
            <Tab label="Map" value="map" />
            <Tab label="CAD" value="cad" />
            <Tab label="ROI" value="roi" />
            <Tab label="Learning" value="learning" />
            <Tab label="Test" value="test" />
          </Tabs>
        </Box>

        {/* Error Alert */}
        {state.error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setState(prev => ({ ...prev, error: null }))}>
            {state.error}
          </Alert>
        )}

        {/* File Upload Zone */}
        <Box sx={{ mb: 3 }}>
          <DragDropZone
            category={state.currentCategory}
            onFilesSelected={handleFilesSelected}
            disabled={state.loading}
          />
        </Box>

        {/* Loading Indicator */}
        {state.loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* File List */}
        {!state.loading && (
          <>
            <FileListTable
              files={state.files}
              category={state.currentCategory}
              onDownload={handleDownload}
              onDownloadLatest={handleDownloadLatest}
            />

            {/* Pagination */}
            {state.pagination.totalPages > 1 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  currentPage={state.pagination.page}
                  totalPages={state.pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};
```

**Validation:**
- [ ] Component structure follows existing views
- [ ] Material-UI components used properly
- [ ] State management via ViewModel
- [ ] Error handling with Alert component
- [ ] Loading states handled

---

#### 3.3 Create Category Tabs Component
**File:** `src/components/FileList/CategoryTabs.tsx` (Optional - can be inline in view)

**Dependencies:** Phase 1
**Estimated Time:** 1 hour

**Implementation:**
Inline in ProjectFileRepositoryView (already done in 3.2) or extract as separate component.

**Validation:**
- [ ] Tabs switch categories correctly
- [ ] Active tab highlighted
- [ ] Follows Material-UI Tabs API

---

#### 3.4 Create File List Table Component
**File:** `src/components/FileList/FileListTable.tsx`

**Dependencies:** Phase 1
**Estimated Time:** 3-4 hours

**Implementation:**
```typescript
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { FileInfo, FileCategory } from '../../models/FileStorage';
import { VersionHistory } from './VersionHistory';

interface FileListTableProps {
  files: FileInfo[];
  category: FileCategory;
  onDownload: (filename: string, originalName: string) => void;
  onDownloadLatest: (originalName: string) => void;
}

export const FileListTable: React.FC<FileListTableProps> = ({
  files,
  category,
  onDownload,
  onDownloadLatest,
}) => {
  // Group files by original_name for versioned categories
  const isVersioned = ['map', 'cad', 'roi'].includes(category);

  const fileGroups = isVersioned ? groupFilesByOriginalName(files) : { '': files };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (files.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="body1" color="text.secondary">
          업로드된 파일이 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>파일명</TableCell>
            <TableCell>크기</TableCell>
            <TableCell>업로드 날짜</TableCell>
            {isVersioned && <TableCell>버전</TableCell>}
            {(category === 'learning' || category === 'test') && <TableCell>CCTV ID</TableCell>}
            <TableCell align="center">다운로드</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isVersioned ? (
            // Render with version grouping
            Object.entries(fileGroups).map(([originalName, groupFiles]) => (
              <VersionHistory
                key={originalName}
                originalName={originalName}
                files={groupFiles}
                onDownload={onDownload}
                onDownloadLatest={onDownloadLatest}
                formatFileSize={formatFileSize}
                formatDate={formatDate}
              />
            ))
          ) : (
            // Render flat list for non-versioned categories
            files.map((file) => (
              <TableRow key={file.filename}>
                <TableCell>{file.original_name || file.filename}</TableCell>
                <TableCell>{formatFileSize(file.size_bytes)}</TableCell>
                <TableCell>{formatDate(file.upload_date)}</TableCell>
                {(category === 'learning' || category === 'test') && (
                  <TableCell>{file.cctv_id || '-'}</TableCell>
                )}
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onDownload(file.filename, file.original_name)}
                  >
                    <DownloadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Helper function to group files by original name
function groupFilesByOriginalName(files: FileInfo[]): Record<string, FileInfo[]> {
  const groups: Record<string, FileInfo[]> = {};

  files.forEach(file => {
    const key = file.original_name || file.filename;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(file);
  });

  // Sort each group by version (descending)
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => b.version.localeCompare(a.version));
  });

  return groups;
}
```

**Validation:**
- [ ] Table renders correctly for all categories
- [ ] Version grouping works for map/cad/roi
- [ ] Flat list for learning/test
- [ ] File size formatting correct
- [ ] Date formatting correct
- [ ] Download buttons functional

---

#### 3.5 Create Version History Component
**File:** `src/components/FileList/VersionHistory.tsx`

**Dependencies:** Phase 1
**Estimated Time:** 2-3 hours

**Implementation:**
```typescript
import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DownloadIcon from '@mui/icons-material/Download';
import GetAppIcon from '@mui/icons-material/GetApp';
import { FileInfo } from '../../models/FileStorage';

interface VersionHistoryProps {
  originalName: string;
  files: FileInfo[];
  onDownload: (filename: string, originalName: string) => void;
  onDownloadLatest: (originalName: string) => void;
  formatFileSize: (bytes: number) => string;
  formatDate: (isoDate: string) => string;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  originalName,
  files,
  onDownload,
  onDownloadLatest,
  formatFileSize,
  formatDate,
}) => {
  const [expanded, setExpanded] = useState(false);

  const latestFile = files[0]; // Files already sorted by version desc
  const olderVersions = files.slice(1);

  return (
    <>
      {/* Latest Version Row */}
      <TableRow sx={{ '& > *': { borderBottom: expanded ? 'none' : undefined } }}>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {olderVersions.length > 0 && (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            <Typography variant="body2">{originalName}</Typography>
            <Chip label="최신" size="small" color="primary" />
          </Box>
        </TableCell>
        <TableCell>{formatFileSize(latestFile.size_bytes)}</TableCell>
        <TableCell>{formatDate(latestFile.upload_date)}</TableCell>
        <TableCell>
          <Chip label={`v${latestFile.version}`} size="small" variant="outlined" />
        </TableCell>
        <TableCell align="center">
          <IconButton
            size="small"
            color="primary"
            onClick={() => onDownloadLatest(originalName)}
            title="최신 버전 다운로드"
          >
            <GetAppIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Older Versions */}
      {olderVersions.length > 0 && (
        <TableRow>
          <TableCell colSpan={5} sx={{ py: 0, borderBottom: expanded ? undefined : 'none' }}>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 6, py: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                  이전 버전
                </Typography>
                {olderVersions.map((file) => (
                  <Box
                    key={file.filename}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: '1px solid #e0e0e0',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Chip label={`v${file.version}`} size="small" variant="outlined" />
                      <Typography variant="body2">{formatFileSize(file.size_bytes)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(file.upload_date)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => onDownload(file.filename, originalName)}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
```

**Validation:**
- [ ] Accordion expand/collapse works
- [ ] Latest version highlighted
- [ ] Older versions styled differently
- [ ] Download buttons work for each version
- [ ] Latest download button uses downloadLatest API

---

#### 3.6 Create Pagination Component
**File:** `src/components/FileList/Pagination.tsx`

**Dependencies:** None
**Estimated Time:** 1 hour

**Implementation:**
```typescript
import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        size="small"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        <NavigateBeforeIcon />
      </IconButton>

      {getPageNumbers().map(page => (
        <IconButton
          key={page}
          size="small"
          onClick={() => onPageChange(page)}
          sx={{
            backgroundColor: page === currentPage ? 'primary.main' : 'transparent',
            color: page === currentPage ? 'white' : 'text.primary',
            '&:hover': {
              backgroundColor: page === currentPage ? 'primary.dark' : 'action.hover',
            },
          }}
        >
          <Typography variant="body2">{page}</Typography>
        </IconButton>
      ))}

      <IconButton
        size="small"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <NavigateNextIcon />
      </IconButton>

      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
        {currentPage} / {totalPages}
      </Typography>
    </Box>
  );
};
```

**Validation:**
- [ ] Previous/Next buttons work
- [ ] Page numbers clickable
- [ ] Current page highlighted
- [ ] Disabled states correct
- [ ] Responsive layout

---

### Phase 3 Completion Checklist

- [ ] FileRepositoryViewModel functional
- [ ] ProjectFileRepositoryView renders correctly
- [ ] Category tabs switch properly
- [ ] File list table displays all data
- [ ] Version history accordion works
- [ ] Pagination functional
- [ ] All Material-UI components styled consistently
- [ ] No TypeScript errors

**Testing:**
- Switch between categories
- Upload files in each category
- View file list with pagination
- Expand/collapse version history
- Navigate between pages
- Test with empty file lists

---

## Phase 4: Upload/Download (2-3 days)

### Objective
Implement drag-and-drop file upload, file selection, and download functionality.

### Prerequisites
- Phase 1 complete
- Phase 3 UI structure in place

### Tasks

#### 4.1 Create DragDropZone Component
**File:** `src/components/FileUpload/DragDropZone.tsx`

**Dependencies:** Phase 1
**Estimated Time:** 2-3 hours

**Implementation:**
```typescript
import React, { useState, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FileCategory } from '../../models/FileStorage';
import { ChunkUploader } from '../../utils/ChunkUploader';

interface DragDropZoneProps {
  category: FileCategory;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({
  category,
  onFilesSelected,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Get accepted file extensions by category
  const getAcceptedExtensions = (): string => {
    switch (category) {
      case 'map':
      case 'cad':
      case 'roi':
        return '.json,.dxf,.dwg';
      case 'learning':
      case 'test':
        return '.jpg,.jpeg,.png';
      default:
        return '*';
    }
  };

  // Validate files
  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const validation = ChunkUploader.validateFile(file, category);
      if (validation.valid) {
        valid.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    return { valid, errors };
  };

  // Handle file input change
  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
  };

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled, category]);

  const handleFiles = (files: File[]) => {
    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      console.warn('[DragDropZone] Validation errors:', errors);
      alert(errors.join('\n'));
    }

    if (valid.length > 0) {
      onFilesSelected(valid);
    }
  };

  return (
    <Box
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        border: '2px dashed',
        borderColor: isDragging ? 'primary.main' : 'grey.400',
        borderRadius: 2,
        padding: 4,
        textAlign: 'center',
        backgroundColor: isDragging ? 'action.hover' : 'background.default',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: disabled ? 'grey.400' : 'primary.light',
          backgroundColor: disabled ? 'background.default' : 'action.hover',
        },
      }}
    >
      <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />

      <Typography variant="h6" gutterBottom>
        파일을 여기에 드래그하거나 클릭하여 선택하세요
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        허용 형식: {getAcceptedExtensions()}
      </Typography>

      <input
        type="file"
        multiple
        accept={getAcceptedExtensions()}
        onChange={handleFileInput}
        disabled={disabled}
        style={{ display: 'none' }}
        id={`file-input-${category}`}
      />

      <label htmlFor={`file-input-${category}`}>
        <Button
          variant="contained"
          component="span"
          disabled={disabled}
          startIcon={<CloudUploadIcon />}
        >
          파일 선택
        </Button>
      </label>
    </Box>
  );
};
```

**Validation:**
- [ ] Drag and drop works
- [ ] File input button works
- [ ] File validation functional
- [ ] Visual feedback for drag state
- [ ] Disabled state handled
- [ ] Multiple file selection supported

---

#### 4.2 Create FileUploadButton Component
**File:** `src/components/FileUpload/FileUploadButton.tsx` (Optional - can use inline button)

**Dependencies:** None
**Estimated Time:** 30 minutes

**Implementation:**
Simple button component or inline in DragDropZone (already done in 4.1).

**Validation:**
- [ ] Button triggers file input
- [ ] Styled consistently

---

#### 4.3 Implement Download Functionality
**File:** Already implemented in `FileStorageService.ts` and `FileRepositoryViewModel.ts`

**Dependencies:** Phase 1
**Estimated Time:** 1 hour (testing)

**Verification Steps:**
1. Test download from FileListTable
2. Test download latest version
3. Verify browser triggers download
4. Test with various file sizes
5. Test error handling

**Validation:**
- [ ] Download button triggers download
- [ ] Filename preserved correctly
- [ ] Large files download successfully
- [ ] Error messages display on failure

---

#### 4.4 Implement Error Handling
**File:** Multiple files (ViewModel, Service, Components)

**Dependencies:** All previous tasks
**Estimated Time:** 2-3 hours

**Implementation:**
Add comprehensive error handling throughout:

1. **Service Layer:** Catch and log errors
2. **ViewModel Layer:** Set error state, display messages
3. **Component Layer:** Show error alerts/snackbars

**Error Scenarios:**
- Upload fails (network, server error)
- Download fails (file not found, network)
- List files fails (API error)
- File validation fails (size, type)
- Chunk upload interrupted

**Validation:**
- [ ] All error scenarios handled gracefully
- [ ] User-friendly error messages
- [ ] Errors logged to console
- [ ] Error state cleared appropriately
- [ ] Snackbar/alert dismissible

---

### Phase 4 Completion Checklist

- [ ] DragDropZone functional
- [ ] File upload works with progress
- [ ] File download functional
- [ ] Error handling comprehensive
- [ ] User feedback clear
- [ ] Large files handled via chunks
- [ ] Multiple file upload works

**Testing:**
- Drag and drop files
- Click to select files
- Upload small files (<1MB)
- Upload large files (>10MB)
- Download files
- Test network failures
- Test invalid file types

---

## Phase 5: Advanced Features (2 days)

### Objective
Implement version history UI, CCTV ID filtering, latest version download, and multiple file upload.

### Prerequisites
- Phases 1-4 complete

### Tasks

#### 5.1 Implement Version History UI
**File:** Already created in `src/components/FileList/VersionHistory.tsx`

**Dependencies:** Phase 3
**Estimated Time:** 1 hour (testing + refinements)

**Enhancements:**
- Add version comparison tooltip
- Show version count badge
- Improve styling

**Validation:**
- [ ] Version grouping correct
- [ ] Expand/collapse smooth
- [ ] Latest version clearly marked
- [ ] Old versions accessible

---

#### 5.2 Implement CCTV ID Filtering
**File:** `src/components/FileList/CctvIdFilter.tsx`

**Dependencies:** Phase 3
**Estimated Time:** 2-3 hours

**Implementation:**
```typescript
import React, { useState, useEffect } from 'react';
import { TextField, Autocomplete, Box, Typography } from '@mui/material';
import { FileInfo } from '../../models/FileStorage';

interface CctvIdFilterProps {
  files: FileInfo[];
  selectedCctvId?: string;
  onCctvIdChange: (cctvId: string | undefined) => void;
}

export const CctvIdFilter: React.FC<CctvIdFilterProps> = ({
  files,
  selectedCctvId,
  onCctvIdChange,
}) => {
  const [cctvIds, setCctvIds] = useState<string[]>([]);

  // Extract unique CCTV IDs from files
  useEffect(() => {
    const uniqueIds = Array.from(new Set(
      files
        .map(file => file.cctv_id)
        .filter(id => id !== undefined && id !== '') as string[]
    )).sort();

    setCctvIds(uniqueIds);
  }, [files]);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        CCTV ID 필터
      </Typography>
      <Autocomplete
        options={cctvIds}
        value={selectedCctvId || null}
        onChange={(event, newValue) => {
          onCctvIdChange(newValue || undefined);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="CCTV ID 선택"
            size="small"
            variant="outlined"
          />
        )}
        sx={{ maxWidth: 300 }}
      />
    </Box>
  );
};
```

**Integration:**
Add to `ProjectFileRepositoryView.tsx` for learning/test categories:

```typescript
{(state.currentCategory === 'learning' || state.currentCategory === 'test') && (
  <CctvIdFilter
    files={state.files}
    selectedCctvId={state.selectedCctvId}
    onCctvIdChange={(cctvId) => viewModel.setCctvId(cctvId)}
  />
)}
```

**Validation:**
- [ ] CCTV ID list populated from files
- [ ] Filtering works correctly
- [ ] Clear filter option available
- [ ] Only shows for learning/test categories

---

#### 5.3 Implement Latest Version Download
**File:** Already implemented in Phase 3/4

**Dependencies:** Phases 3-4
**Estimated Time:** 30 minutes (testing)

**Verification:**
- Check VersionHistory component has "Download Latest" button
- Verify it calls `onDownloadLatest` callback
- Test downloading latest version

**Validation:**
- [ ] Latest download button visible
- [ ] Downloads most recent version
- [ ] Works for all versioned categories

---

#### 5.4 Implement Multiple File Upload
**File:** Already supported in `DragDropZone.tsx` and `FileStorageService.ts`

**Dependencies:** Phase 4
**Estimated Time:** 1 hour (testing)

**Enhancements:**
- Show upload progress for each file
- Display file count during upload
- Handle partial upload failures

**Validation:**
- [ ] Multiple files selected together
- [ ] All files uploaded
- [ ] Progress tracked
- [ ] Failures reported individually

---

### Phase 5 Completion Checklist

- [ ] Version history fully functional
- [ ] CCTV ID filtering works
- [ ] Latest version download works
- [ ] Multiple file upload reliable
- [ ] All advanced features tested
- [ ] UI polished and intuitive

**Testing:**
- View version history for multiple files
- Filter learning/test files by CCTV ID
- Download latest versions
- Upload 10+ files at once
- Test edge cases (no versions, no CCTV IDs)

---

## Phase 6: Testing & Optimization (1-2 days)

### Objective
Comprehensive testing, performance optimization, and bug fixes.

### Prerequisites
- Phases 1-5 complete

### Tasks

#### 6.1 Integration Testing
**Estimated Time:** 3-4 hours

**Test Scenarios:**
1. **Map Editor Auto-Save:**
   - Export map → verify local download
   - Export map → verify server upload (backend logs)
   - Export large map (>10MB)
   - Export with network failure

2. **File Repository UI:**
   - Load files for each category
   - Switch between categories
   - Upload files in each category
   - Download files
   - Version history interaction
   - CCTV ID filtering
   - Pagination

3. **Error Scenarios:**
   - Network disconnected during upload
   - Server returns error
   - Invalid file type
   - File size exceeds limit
   - Empty file list

**Validation:**
- [ ] All user stories acceptance criteria met
- [ ] No console errors
- [ ] Error messages user-friendly
- [ ] Loading states appropriate

---

#### 6.2 Performance Optimization
**Estimated Time:** 2-3 hours

**Optimization Areas:**
1. **Component Rendering:**
   - Use `React.memo` for expensive components
   - Optimize re-renders in FileListTable
   - Lazy load version history

2. **API Calls:**
   - Implement debouncing for filters
   - Cache file lists per category
   - Optimize pagination requests

3. **File Operations:**
   - Stream large file downloads
   - Optimize chunk size dynamically
   - Cancel ongoing uploads on navigation

**Implementation Examples:**
```typescript
// Memoize FileListTable
export const FileListTable = React.memo<FileListTableProps>(({
  files,
  category,
  onDownload,
  onDownloadLatest,
}) => {
  // ... component code
});

// Debounce CCTV ID filter
const debouncedSetCctvId = useMemo(
  () => debounce((cctvId: string | undefined) => {
    viewModel.setCctvId(cctvId);
  }, 500),
  [viewModel]
);
```

**Validation:**
- [ ] File list loads in <3 seconds
- [ ] Category switching smooth
- [ ] No unnecessary re-renders
- [ ] Large file uploads don't freeze UI

---

#### 6.3 Bug Fixes
**Estimated Time:** 2-4 hours

**Bug Tracking:**
- Create list of known issues
- Prioritize by severity
- Fix systematically
- Verify fixes

**Common Bug Areas:**
- Version grouping edge cases
- Pagination with filters
- File name sanitization
- Date formatting inconsistencies
- Upload progress accuracy

**Validation:**
- [ ] All known bugs fixed
- [ ] Edge cases handled
- [ ] No regressions introduced

---

#### 6.4 Code Quality Review
**Estimated Time:** 1-2 hours

**Review Checklist:**
- [ ] TypeScript: No `any` types
- [ ] ESLint: No warnings
- [ ] Console logs: Removed or prefixed properly
- [ ] Comments: Added for complex logic
- [ ] Imports: Organized and clean
- [ ] Naming: Consistent and descriptive
- [ ] MVVM: Properly separated
- [ ] Error handling: Comprehensive

**Tools:**
```bash
# Run TypeScript check
npx tsc --noEmit

# Run ESLint
npx eslint src/

# Check bundle size
npm run build
```

**Validation:**
- [ ] TypeScript compilation clean
- [ ] ESLint passes with no warnings
- [ ] Code formatted consistently
- [ ] No unused imports/variables

---

### Phase 6 Completion Checklist

- [ ] All integration tests passed
- [ ] Performance optimized
- [ ] All bugs fixed
- [ ] Code quality reviewed
- [ ] Documentation updated
- [ ] Ready for production

**Final Testing:**
- End-to-end user journey
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness (if applicable)
- Accessibility check
- Network throttling test

---

## Implementation Summary

### Timeline Overview

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1 | 2-3 days | Models, Service, API Config, Chunk Uploader |
| Phase 2 | 1-2 days | Map Editor Auto-Save Integration |
| Phase 3 | 3-4 days | File Repository UI, Tables, Pagination |
| Phase 4 | 2-3 days | Upload/Download, Error Handling |
| Phase 5 | 2 days | Version History, CCTV Filter, Advanced Features |
| Phase 6 | 1-2 days | Testing, Optimization, Bug Fixes |
| **Total** | **11-16 days** | **Complete Feature** |

### Success Metrics

**Quantitative:**
- [ ] Auto-save success rate > 95%
- [ ] File upload success rate > 98%
- [ ] File download success rate > 99%
- [ ] Page load time < 3 seconds
- [ ] 50MB file upload < 30 seconds

**Qualitative:**
- [ ] Code follows MVVM pattern
- [ ] TypeScript errors: 0
- [ ] ESLint warnings: 0
- [ ] User-friendly error messages
- [ ] Intuitive UI/UX

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Backend API changes | Version API endpoints (v0.1) |
| Large file uploads | Implement chunk upload with progress |
| Network failures | Retry logic, error handling |
| Browser compatibility | Test on major browsers |
| Performance issues | Optimize rendering, lazy loading |

### Next Steps After Implementation

1. **User Acceptance Testing (UAT)**
   - Get feedback from actual users
   - Iterate based on feedback

2. **Documentation**
   - User guide for file repository
   - Developer documentation for maintenance

3. **Monitoring**
   - Track upload/download success rates
   - Monitor API errors
   - Measure page performance

4. **Future Enhancements**
   - File deletion functionality
   - File preview (images, JSON)
   - Search and advanced filtering
   - Batch operations

---

## Appendix

### File Structure Overview

```
frontend/src/
├── models/
│   └── FileStorage.ts                    # All TypeScript interfaces
├── services/
│   └── FileStorageService.ts             # API service layer
├── utils/
│   └── ChunkUploader.ts                  # Chunk upload utility
├── viewmodels/
│   ├── FileRepositoryViewModel.ts        # File repository logic
│   └── MapEditorAutoSaveViewModel.ts     # Auto-save logic
├── views/
│   └── ProjectFileRepositoryView.tsx     # Main repository page
├── components/
│   ├── FileUpload/
│   │   └── DragDropZone.tsx              # Drag & drop component
│   ├── FileList/
│   │   ├── FileListTable.tsx             # File list table
│   │   ├── VersionHistory.tsx            # Version accordion
│   │   ├── Pagination.tsx                # Pagination controls
│   │   └── CctvIdFilter.tsx              # CCTV ID filter
│   └── MapEditor/
│       └── AutoSaveIndicator.tsx         # Save status indicator
└── config/
    └── api.ts                            # API endpoints (updated)
```

### References

- **PRD:** `.claude/prds/map-editor-integration.md`
- **Backend API Docs:** `/backend/docs/FILE_STORAGE_API_GUIDE.md`
- **Auto-Upload Guide:** `/backend/docs/MAP_EDITOR_AUTO_UPLOAD.md`
- **Existing Patterns:**
  - `src/viewmodels/FileUploadViewModel.ts`
  - `src/services/FileUploadService.ts`
  - `src/views/FileUploadView.tsx`

### Contact & Support

For questions or issues during implementation:
- Review PRD and backend API documentation
- Check existing code patterns
- Consult with backend team for API clarifications
