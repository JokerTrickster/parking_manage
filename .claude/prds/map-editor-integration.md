---
name: map-editor-integration
description: 맵 에디터 자동 저장 및 프로젝트 파일 보관함 프론트엔드 구현
status: backlog
created: 2025-10-27T08:05:12Z
---

# PRD: Map Editor Integration & Project File Repository Frontend

## Executive Summary

주차장 관리 시스템의 맵 에디터에서 JSON 파일 내보내기 시 자동으로 서버에 업로드하는 기능과, 5가지 파일 카테고리(map, cad, roi, learning, test)를 관리할 수 있는 프로젝트 파일 보관함 UI를 구현합니다. 기존 백엔드 File Storage API(v0.1)와 연동하여 파일 업로드, 목록 조회, 다운로드, 버전 관리 기능을 제공합니다.

**핵심 가치:**
- 맵 에디터 작업물의 자동 백업 및 버전 관리
- 프로젝트별 파일 중앙 집중 관리
- 청크 업로드를 통한 대용량 파일 지원
- 기존 MVVM 아키텍처와의 일관성 유지

## Problem Statement

### 현재 문제점
1. **맵 에디터 데이터 손실 위험**: 맵 에디터에서 JSON 파일을 내보낼 때 로컬에만 저장되어 작업물이 유실될 수 있음
2. **파일 관리 분산**: CAD 도면, ROI 설정, 학습/테스트 이미지 등이 각기 다른 방식으로 관리됨
3. **버전 관리 부재**: 맵 파일의 변경 이력을 추적하기 어려움
4. **협업 어려움**: 팀원 간 최신 파일 공유가 어려움

### 해결 목표
- 맵 에디터에서 내보내기 시 **자동으로 서버에 백업**
- **통합된 파일 보관함 UI**로 모든 프로젝트 파일을 한 곳에서 관리
- 백엔드 API의 **자동 버전 관리** 활용
- 대용량 파일을 위한 **청크 업로드** 지원

## User Stories

### 1. 맵 에디터 사용자 (Primary)

**US-1: 맵 파일 자동 저장**
```
AS A 맵 에디터 사용자
I WANT TO 내보내기 버튼을 누르면 로컬 다운로드와 함께 서버에 자동 저장되기를
SO THAT 작업물을 안전하게 백업하고 버전 관리할 수 있다
```

**Acceptance Criteria:**
- [ ] 맵 에디터의 "내보내기" 버튼 클릭 시
- [ ] 로컬 다운로드(기존 동작) + 서버 업로드(신규) 동시 실행
- [ ] 업로드 중 로딩 인디케이터 표시
- [ ] 업로드 성공 시 토스트 알림 표시 (옵션)
- [ ] 백그라운드에서 비동기 처리 (202 Accepted)
- [ ] 실패 시 사용자에게 알리지 않음 (서버 로그만 기록)

**US-2: 자동 저장 상태 확인**
```
AS A 맵 에디터 사용자
I WANT TO 저장 진행 상태를 시각적으로 확인하기를
SO THAT 저장이 완료될 때까지 기다릴 수 있다
```

**Acceptance Criteria:**
- [ ] 저장 중: 로딩 스피너 또는 진행바 표시
- [ ] 저장 완료: 인디케이터 자동 종료
- [ ] UI 블로킹 없음 (non-blocking)

### 2. 프로젝트 관리자

**US-3: 프로젝트 파일 보관함 접근**
```
AS A 프로젝트 관리자
I WANT TO 프로젝트별로 모든 파일을 한 곳에서 보고 관리하기를
SO THAT 파일을 체계적으로 정리하고 필요할 때 쉽게 찾을 수 있다
```

**Acceptance Criteria:**
- [ ] 별도 페이지 또는 사이드바에서 파일 보관함 접근
- [ ] 5개 카테고리 탭 (map, cad, roi, learning, test)
- [ ] 각 카테고리별 파일 목록 표시
- [ ] 페이지네이션 지원 (기본 100개/페이지)

**US-4: 파일 업로드**
```
AS A 프로젝트 관리자
I WANT TO 각 카테고리별로 파일을 업로드하기를
SO THAT 프로젝트 관련 파일을 중앙 서버에 저장할 수 있다
```

**Acceptance Criteria:**
- [ ] 드래그 앤 드롭으로 파일 업로드
- [ ] 파일 선택 버튼으로 업로드
- [ ] 다중 파일 업로드 지원
- [ ] 청크 업로드로 대용량 파일 처리
- [ ] 업로드 성공/실패 피드백

**US-5: 파일 다운로드**
```
AS A 프로젝트 관리자
I WANT TO 보관함의 파일을 다운로드하기를
SO THAT 로컬에서 파일을 사용할 수 있다
```

**Acceptance Criteria:**
- [ ] 파일 클릭 시 다운로드
- [ ] 최신 버전 다운로드 버튼 (map/cad/roi만)
- [ ] 특정 버전 다운로드 버튼
- [ ] 다운로드 진행 상태 표시

**US-6: 버전 히스토리 확인**
```
AS A 프로젝트 관리자
I WANT TO map/cad/roi 파일의 버전 히스토리를 보기를
SO THAT 이전 버전으로 되돌리거나 변경 이력을 추적할 수 있다
```

**Acceptance Criteria:**
- [ ] 파일명별로 버전 목록 표시
- [ ] 버전별 업로드 날짜/시간 표시
- [ ] 버전별 파일 크기 표시
- [ ] 최신 버전 강조 표시

### 3. CCTV 관리자

**US-7: CCTV ID별 이미지 업로드**
```
AS A CCTV 관리자
I WANT TO learning/test 이미지를 CCTV ID별로 구분하여 업로드하기를
SO THAT 각 CCTV별로 이미지를 체계적으로 관리할 수 있다
```

**Acceptance Criteria:**
- [ ] learning/test 카테고리에서 CCTV ID 선택/입력
- [ ] 폴더 구조 유지하여 업로드
- [ ] CCTV ID별 필터링 기능
- [ ] 업로드된 이미지 목록 확인

## Requirements

### Functional Requirements

#### FR-1: 맵 에디터 자동 저장
- **FR-1.1**: 맵 에디터의 "내보내기" 버튼 클릭 시 JSON 파일 생성
- **FR-1.2**: 생성된 JSON 파일을 로컬 다운로드 (기존 동작 유지)
- **FR-1.3**: 동시에 `POST /v0.1/filestorage/:projectId/map/auto-upload` API 호출
- **FR-1.4**: FormData로 파일 전송 (`file` 필드)
- **FR-1.5**: 현재 선택된 projectId 사용
- **FR-1.6**: 업로드 중 로딩 인디케이터 표시
- **FR-1.7**: 202 Accepted 응답 수신 후 로딩 종료
- **FR-1.8**: 업로드 실패 시 콘솔에만 로그 (사용자 알림 없음)

#### FR-2: 프로젝트 파일 보관함 UI
- **FR-2.1**: `/project-files` 라우트에 파일 보관함 페이지 생성
- **FR-2.2**: 5개 카테고리 탭 UI (map, cad, roi, learning, test)
- **FR-2.3**: 탭 전환 시 해당 카테고리 파일 목록 로드
- **FR-2.4**: 페이지네이션 컴포넌트 (100개/페이지 기본값)

#### FR-3: 파일 업로드
- **FR-3.1**: 드래그 앤 드롭 영역 컴포넌트
- **FR-3.2**: 파일 선택 버튼
- **FR-3.3**: 청크 업로드 구현 (5MB 청크 사이즈)
- **FR-3.4**: 다중 파일 업로드 지원
- **FR-3.5**: 업로드 진행률 표시 (옵션)
- **FR-3.6**: `POST /v0.1/filestorage/:projectId/:category/upload` API 호출

#### FR-4: 파일 목록 조회
- **FR-4.1**: `GET /v0.1/filestorage/:projectId/:category/list` API 호출
- **FR-4.2**: 쿼리 파라미터: `page`, `page_size`, `cctv_id` (learning/test만)
- **FR-4.3**: 파일 정보 표시: 파일명, 크기, 업로드 날짜, 버전
- **FR-4.4**: 최신순 정렬
- **FR-4.5**: CCTV ID 필터링 (learning/test 카테고리)

#### FR-5: 파일 다운로드
- **FR-5.1**: `GET /v0.1/filestorage/:projectId/:category/download/:filename` API 호출
- **FR-5.2**: `GET /v0.1/filestorage/:projectId/:category/latest?original_name=xxx` API 호출
- **FR-5.3**: 브라우저 다운로드 트리거
- **FR-5.4**: 다운로드 진행 상태 표시

#### FR-6: 버전 관리 UI
- **FR-6.1**: map/cad/roi 카테고리에서 파일명별 버전 그룹핑
- **FR-6.2**: 확장 가능한 버전 리스트 (Accordion)
- **FR-6.3**: 각 버전의 타임스탬프, 파일 크기 표시
- **FR-6.4**: 최신 버전 뱃지 표시

### Non-Functional Requirements

#### NFR-1: Performance
- **NFR-1.1**: 파일 목록 로딩 3초 이내
- **NFR-1.2**: 청크 업로드로 50MB 이상 파일 지원
- **NFR-1.3**: 페이지네이션으로 대량 파일 처리
- **NFR-1.4**: 맵 에디터 자동 저장이 UI를 블로킹하지 않음

#### NFR-2: Usability
- **NFR-2.1**: 직관적인 드래그 앤 드롭 UI
- **NFR-2.2**: 명확한 업로드/다운로드 진행 피드백
- **NFR-2.3**: 에러 메시지는 사용자 친화적으로
- **NFR-2.4**: Material-UI 기반 일관된 디자인

#### NFR-3: Reliability
- **NFR-3.1**: 업로드 실패 시 재시도 메커니즘
- **NFR-3.2**: 네트워크 오류 처리
- **NFR-3.3**: 청크 업로드 실패 시 이어서 업로드

#### NFR-4: Maintainability
- **NFR-4.1**: MVVM 패턴 준수 (ViewModel, Service, View 분리)
- **NFR-4.2**: 기존 코드 스타일 가이드 준수
- **NFR-4.3**: TypeScript 타입 안전성
- **NFR-4.4**: 재사용 가능한 컴포넌트 설계

#### NFR-5: Security
- **NFR-5.1**: 파일 타입 검증 (클라이언트 사이드)
- **NFR-5.2**: 파일 크기 제한 (100MB)
- **NFR-5.3**: XSS 방지를 위한 파일명 sanitize

## Technical Specifications

### Architecture

#### Component Structure
```
src/
├── views/
│   └── ProjectFileRepositoryView.tsx       # 파일 보관함 메인 페이지
├── components/
│   ├── FileUpload/
│   │   ├── DragDropZone.tsx              # 드래그 앤 드롭 영역
│   │   ├── FileUploadButton.tsx          # 파일 선택 버튼
│   │   └── ChunkUploader.tsx             # 청크 업로드 로직
│   ├── FileList/
│   │   ├── FileListTable.tsx             # 파일 목록 테이블
│   │   ├── FileListItem.tsx              # 파일 아이템
│   │   ├── VersionHistory.tsx            # 버전 히스토리
│   │   └── Pagination.tsx                # 페이지네이션
│   └── MapEditor/
│       └── AutoSaveIndicator.tsx         # 자동 저장 인디케이터
├── viewmodels/
│   ├── FileRepositoryViewModel.ts        # 파일 보관함 로직
│   └── MapEditorAutoSaveViewModel.ts     # 맵 에디터 자동 저장 로직
├── services/
│   └── FileStorageService.ts             # File Storage API 호출
├── models/
│   ├── FileStorage.ts                    # 파일 관련 타입
│   └── FileCategory.ts                   # 카테고리 타입
└── config/
    └── api.ts                            # API 엔드포인트 추가
```

### API Integration

#### Endpoints to Integrate

```typescript
// api.ts에 추가할 엔드포인트

export const FILE_STORAGE_ENDPOINTS = {
  // Auto-upload for map editor
  AUTO_UPLOAD_MAP: (projectId: string) =>
    `/v0.1/filestorage/${projectId}/map/auto-upload`,

  // Upload
  UPLOAD: (projectId: string, category: FileCategory) =>
    `/v0.1/filestorage/${projectId}/${category}/upload`,

  // List
  LIST: (projectId: string, category: FileCategory, page?: number, pageSize?: number, cctvId?: string) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (cctvId) params.append('cctv_id', cctvId);
    return `/v0.1/filestorage/${projectId}/${category}/list?${params.toString()}`;
  },

  // Download
  DOWNLOAD: (projectId: string, category: FileCategory, filename: string) =>
    `/v0.1/filestorage/${projectId}/${category}/download/${filename}`,

  // Download latest
  DOWNLOAD_LATEST: (projectId: string, category: FileCategory, originalName: string) =>
    `/v0.1/filestorage/${projectId}/${category}/latest?original_name=${originalName}`,
};
```

#### Request/Response Models

```typescript
// models/FileStorage.ts

export type FileCategory = 'map' | 'cad' | 'roi' | 'learning' | 'test';

export interface FileInfo {
  filename: string;           // 실제 파일명 (버전 포함)
  original_name: string;      // 원본 파일명
  version: string;            // 버전 타임스탬프
  size_bytes: number;         // 파일 크기
  upload_date: string;        // 업로드 날짜 (ISO 8601)
  file_type: string;          // MIME 타입
  path: string;               // 서버 경로
  cctv_id?: string;           // CCTV ID (learning/test만)
}

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

export interface AutoUploadResponse {
  success: boolean;
  message: string;
  data: {
    project_id: string;
    filename: string;
  };
}
```

### State Management

#### FileRepositoryViewModel

```typescript
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
  selectedCctvId?: string;  // learning/test용
  uploadProgress: number;
}

export class FileRepositoryViewModel {
  // 파일 목록 로드
  async loadFiles(category: FileCategory, page?: number): Promise<void>

  // 파일 업로드 (청크)
  async uploadFiles(category: FileCategory, files: File[]): Promise<void>

  // 파일 다운로드
  async downloadFile(category: FileCategory, filename: string): Promise<void>

  // 최신 버전 다운로드
  async downloadLatest(category: FileCategory, originalName: string): Promise<void>

  // 카테고리 변경
  setCategory(category: FileCategory): void

  // CCTV ID 필터링
  setCctvId(cctvId: string): void

  // 페이지 변경
  changePage(page: number): void
}
```

#### MapEditorAutoSaveViewModel

```typescript
export interface AutoSaveState {
  saving: boolean;
  success: boolean | null;
  error: string | null;
}

export class MapEditorAutoSaveViewModel {
  // 맵 파일 자동 저장
  async autoSave(projectId: string, mapData: object): Promise<void>

  // 로컬 다운로드 (기존 기능 유지)
  downloadLocal(mapData: object, filename: string): void

  // 상태 리셋
  resetState(): void
}
```

### Chunk Upload Implementation

```typescript
// services/FileStorageService.ts

export class FileStorageService {
  private readonly CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

  async uploadWithChunks(
    projectId: string,
    category: FileCategory,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.CHUNK_SIZE;
      const end = Math.min(start + this.CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('files', chunk, file.name);
      formData.append('chunk_index', i.toString());
      formData.append('total_chunks', totalChunks.toString());

      await axios.post(
        FILE_STORAGE_ENDPOINTS.UPLOAD(projectId, category),
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const chunkProgress = (e.loaded / e.total!) * 100;
            const totalProgress = ((i + chunkProgress / 100) / totalChunks) * 100;
            onProgress?.(totalProgress);
          }
        }
      );
    }

    // 최종 응답 반환
    return { success: true, message: 'Upload completed', data: {...} };
  }
}
```

## UI/UX Design

### File Repository Page Layout

```
┌─────────────────────────────────────────────────┐
│  프로젝트 파일 보관함                              │
│  현재 프로젝트: [banpo ▼]                        │
├─────────────────────────────────────────────────┤
│  [Map] [CAD] [ROI] [Learning] [Test]           │ <- 카테고리 탭
├─────────────────────────────────────────────────┤
│  📂 파일 업로드                                   │
│  ┌─────────────────────────────────────────┐   │
│  │  드래그 앤 드롭 또는 클릭하여 파일 선택    │   │
│  │  [파일 선택]                             │   │
│  └─────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│  📋 파일 목록 (총 45개)                          │
│  ┌───────┬─────────┬────────┬──────┬──────┐   │
│  │파일명  │  크기   │업로드일 │버전  │다운로드│   │
│  ├───────┼─────────┼────────┼──────┼──────┤   │
│  │map.json│ 2.5MB  │10/27   │v3 ▼ │ [↓]  │   │
│  │  └v2   │ 2.4MB  │10/26   │      │ [↓]  │   │
│  │  └v1   │ 2.3MB  │10/25   │      │ [↓]  │   │
│  │cad.dxf │ 15MB   │10/20   │v1    │ [↓]  │   │
│  └───────┴─────────┴────────┴──────┴──────┘   │
│  [◄] [1] [2] [3] [►]                           │ <- 페이지네이션
└─────────────────────────────────────────────────┘
```

### Map Editor Auto-Save Indicator

```
맵 에디터 상단 우측에 배치:

┌─────────────────────────┐
│ [내보내기]  💾 저장 중...  │  <- 저장 중
└─────────────────────────┘

┌─────────────────────────┐
│ [내보내기]  ✓ 저장 완료   │  <- 저장 완료 (2초 후 사라짐)
└─────────────────────────┘
```

## Success Criteria

### Quantitative Metrics

1. **기능 완성도**
   - [ ] 맵 에디터 자동 저장 성공률 > 95%
   - [ ] 파일 업로드 성공률 > 98%
   - [ ] 파일 다운로드 성공률 > 99%
   - [ ] 청크 업로드 50MB 파일 성공

2. **성능**
   - [ ] 파일 목록 로딩 시간 < 3초
   - [ ] 자동 저장 API 응답 시간 < 1초 (202 Accepted)
   - [ ] 대용량 파일(50MB) 업로드 < 30초

3. **사용성**
   - [ ] 드래그 앤 드롭 동작 정상
   - [ ] 페이지네이션 정상 작동
   - [ ] 버전 히스토리 UI 정상 표시

### Qualitative Metrics

1. **코드 품질**
   - [ ] TypeScript 타입 에러 0개
   - [ ] ESLint 경고 0개
   - [ ] MVVM 패턴 준수
   - [ ] 재사용 가능한 컴포넌트 설계

2. **사용자 경험**
   - [ ] 직관적인 UI/UX
   - [ ] 명확한 피드백 메시지
   - [ ] 에러 상황 적절히 처리

3. **통합성**
   - [ ] 기존 프로젝트 선택 기능과 연동
   - [ ] 기존 레이아웃과 일관된 디자인
   - [ ] 기존 API 설정 활용

## Constraints & Assumptions

### Constraints

1. **기술적 제약**
   - React 19.1.1 + TypeScript 사용 필수
   - Material-UI 기반 UI 컴포넌트
   - MVVM 아키텍처 패턴 준수
   - 기존 axios 기반 HTTP 클라이언트 사용

2. **시간 제약**
   - 청크 업로드 구현에 시간 소요 예상
   - 버전 히스토리 UI 복잡도

3. **환경 제약**
   - 백엔드 API는 이미 구현 완료 (변경 불가)
   - 프로젝트 ID는 하드코딩된 목록 사용
   - 서버 URL은 api.ts의 설정 사용

### Assumptions

1. **사용자 행동**
   - 사용자는 맵 에디터 "내보내기" 버튼의 의미를 이해함
   - 파일 보관함 접근 방법을 직관적으로 찾을 수 있음
   - 버전 관리 개념을 이해함

2. **기술적 가정**
   - 백엔드 API는 항상 정상 작동
   - 네트워크 연결은 안정적
   - 브라우저는 File API를 지원 (모던 브라우저)
   - 청크 업로드는 순차적으로만 처리

3. **데이터 가정**
   - 파일 크기는 대부분 100MB 이하
   - 프로젝트당 파일 개수는 1000개 이하
   - CCTV ID는 사용자가 직접 입력/선택

## Out of Scope

다음 기능은 **이번 구현에 포함되지 않습니다:**

1. **파일 삭제 기능**
   - 백엔드 API에 삭제 엔드포인트 없음
   - 추후 백엔드 지원 후 추가

2. **파일 미리보기**
   - 이미지 썸네일, JSON 프리뷰 등
   - 별도 기능으로 추후 개발

3. **파일 검색 기능**
   - 파일명 검색, 필터링
   - v2에서 추가 예정

4. **실시간 진행률 표시**
   - 업로드 진행률 표시는 구현하지 않음
   - 로딩 인디케이터만 표시

5. **파일 공유 기능**
   - 팀원에게 링크 공유 등
   - 권한 관리 필요

6. **파일 버전 비교**
   - 두 버전 간 diff 보기
   - 별도 기능으로 추후 개발

7. **배치 다운로드**
   - 여러 파일 한번에 다운로드
   - 추후 백엔드 지원 필요

8. **파일 메타데이터 편집**
   - 파일명 변경, 설명 추가 등
   - 백엔드 지원 필요

## Dependencies

### Internal Dependencies

1. **기존 컴포넌트 재사용**
   - ProjectSelectionView: 프로젝트 선택 상태
   - LayoutView: 레이아웃 및 네비게이션
   - 기존 Material-UI 컴포넌트

2. **기존 서비스 참고**
   - FileUploadService: 파일 업로드 패턴
   - HistoryService: API 호출 패턴
   - api.ts: API 설정

3. **기존 모델 확장**
   - Project: 프로젝트 타입
   - 신규 FileStorage 모델 생성

### External Dependencies

1. **백엔드 API (필수)**
   - File Storage API v0.1 완전 구현됨
   - 모든 엔드포인트 동작 검증 완료

2. **라이브러리**
   - axios: HTTP 클라이언트 (기존 사용 중)
   - Material-UI: UI 컴포넌트 (기존 사용 중)
   - React Router: 라우팅 (기존 사용 중)

3. **브라우저 API**
   - File API: 파일 읽기
   - Blob API: 청크 처리
   - Download API: 파일 다운로드

### Risk Mitigation

1. **백엔드 API 장애**
   - 에러 핸들링 철저히
   - 재시도 로직 구현
   - 사용자 친화적 에러 메시지

2. **대용량 파일 처리**
   - 청크 업로드로 해결
   - 타임아웃 설정 (30초)
   - 진행 상태 피드백

3. **네트워크 불안정**
   - 청크 단위 재시도
   - 자동 저장 실패 시 무시 (백그라운드)

## Implementation Phases

### Phase 1: 기반 작업 (2-3일)
- [ ] 모델 및 타입 정의 (FileStorage.ts)
- [ ] FileStorageService 구현
- [ ] API 엔드포인트 추가 (api.ts)
- [ ] 청크 업로드 유틸리티

### Phase 2: 맵 에디터 통합 (1-2일)
- [ ] MapEditorAutoSaveViewModel 구현
- [ ] AutoSaveIndicator 컴포넌트
- [ ] 맵 에디터에 자동 저장 통합
- [ ] 로딩 인디케이터 추가

### Phase 3: 파일 보관함 UI (3-4일)
- [ ] ProjectFileRepositoryView 페이지
- [ ] 카테고리 탭 컴포넌트
- [ ] 파일 목록 테이블
- [ ] 페이지네이션

### Phase 4: 업로드/다운로드 (2-3일)
- [ ] DragDropZone 컴포넌트
- [ ] FileUploadButton 컴포넌트
- [ ] 다운로드 기능 구현
- [ ] 에러 핸들링

### Phase 5: 고급 기능 (2일)
- [ ] 버전 히스토리 UI
- [ ] CCTV ID 필터링
- [ ] 최신 버전 다운로드
- [ ] 다중 파일 업로드

### Phase 6: 테스트 및 최적화 (1-2일)
- [ ] 통합 테스트
- [ ] 에러 시나리오 테스트
- [ ] 성능 최적화
- [ ] 버그 수정

**총 예상 기간: 11-16일**

## Testing Strategy

### Unit Tests
- FileStorageService 메서드 테스트
- ViewModel 로직 테스트
- 청크 업로드 유틸리티 테스트

### Integration Tests
- API 호출 시나리오 테스트
- 파일 업로드/다운로드 플로우
- 맵 에디터 자동 저장 플로우

### Manual Tests
- 드래그 앤 드롭 동작 확인
- 다양한 파일 크기 업로드
- 버전 히스토리 UI 검증
- 에러 상황 처리 확인

### Acceptance Tests
- 사용자 스토리별 Acceptance Criteria 검증
- 성능 기준 충족 확인
- 크로스 브라우저 테스트 (Chrome, Firefox, Safari)

## Glossary

- **맵 에디터**: 주차장 지도를 생성/편집하는 웹 기반 도구
- **내보내기**: 맵 에디터에서 작업한 내용을 JSON 파일로 저장하는 기능
- **청크 업로드**: 대용량 파일을 작은 조각으로 나누어 순차적으로 업로드하는 방식
- **버전 관리**: 동일 파일의 여러 버전을 타임스탬프로 구분하여 관리
- **파일 카테고리**: map(지도), cad(CAD 도면), roi(관심 영역), learning(학습 이미지), test(테스트 이미지)
- **CCTV ID**: 각 CCTV 카메라를 식별하는 고유 ID
- **projectId**: 프로젝트를 식별하는 고유 ID (예: banpo, osong)

## Appendix

### Backend API Reference

상세 API 문서: `/backend/docs/FILE_STORAGE_API_GUIDE.md`
맵 에디터 통합 가이드: `/backend/docs/MAP_EDITOR_AUTO_UPLOAD.md`

### Frontend Structure Reference

기존 프론트엔드 패턴:
- MVVM: `viewmodels/`, `views/`, `models/`
- Services: `services/`
- Config: `config/api.ts`

### UI Library

Material-UI v5 사용:
- Button, TextField, Dialog, Snackbar
- Table, Pagination
- Tabs, Card, CircularProgress
