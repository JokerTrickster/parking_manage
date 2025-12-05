# Learning Data Management Feature - Implementation Guide

## 📋 Overview

학습 데이터 관리 기능은 ROI 파일과 학습 이미지를 선택하여 주차면에 차량 점유 상태를 표시하는 기능입니다.
프론트엔드 구현이 완료되었으며, 백엔드 API 구현이 필요합니다.

---

## 🎯 Feature Purpose

**목적**: ROI 영역에 색을 입혀서 주차면에 차량이 강제로 차 있는 것으로 학습시키기 위한 기능

**사용 시나리오**:
1. 사용자가 ROI JSON 파일 선택
2. 학습 데이터 폴더 선택 (CCTV별로 구역이 나뉘어 있음)
3. 특정 CCTV 선택하면 첫 번째 이미지 표시
4. ROI 영역을 클릭하여 점유(흰색)/비점유(투명) 상태 토글
5. 저장 시 ROI 영역이 흰색으로 채워진 이미지를 원본 폴더에 덮어쓰기

---

## 🎨 Frontend Implementation (✅ Completed)

### 1. Created Files

#### `frontend/src/models/LearningDataManagement.ts`
**타입 정의**
```typescript
export interface ROIPolygon {
  roi_id: string;
  coords: number[]; // [x1, y1, x2, y2, ...]
  occupied?: boolean;
}

export interface ROIFileData {
  cctv_id: string;
  rois: ROIPolygon[];
  image_width?: number;
  image_height?: number;
}

export interface LearningFolder {
  folder_name: string;
  folder_path: string;
  cctv_count: number;
  cctv_ids: string[];
  image_count: number;
  created_at: string;
}

export interface CCTVInfo {
  cctv_id: string;
  folder_path: string;
  image_files: string[];
  first_image_url?: string;
}
```

#### `frontend/src/services/LearningDataService.ts`
**API 호출 서비스**
- `getROIFileList(projectId)`: ROI 파일 목록 조회
- `getROIFileData(projectId, roiFileName)`: ROI 파일 데이터 로드
- `getLearningFolders(projectId)`: 학습 폴더 목록 조회
- `getCCTVList(projectId, folderPath)`: CCTV 목록 조회
- `getFirstImage(projectId, folderPath, cctvId, imageFileName)`: 이미지 로드
- `saveEditedImage(request)`: 편집된 이미지 저장

#### `frontend/src/components/ROIImageCanvas.tsx`
**캔버스 컴포넌트**
- 이미지 위에 ROI 폴리곤 오버레이
- Point-in-polygon 알고리즘으로 클릭 감지
- 점유/비점유 상태 시각화 (흰색/투명)
- 호버 효과 및 선택 하이라이트

#### `frontend/src/viewmodels/LearningDataManagementViewModel.ts`
**비즈니스 로직**
- 상태 관리
- ROI 파일/폴더/CCTV 선택 처리
- ROI 점유 상태 토글/채우기/비우기
- Canvas API를 사용한 이미지 저장 로직

#### `frontend/src/pages/LearningDataManagementPage.tsx`
**메인 페이지**
- 3단계 선택 UI (ROI 파일 → 학습 폴더 → CCTV)
- 이미지 편집 캔버스
- ROI 목록 및 상태 표시
- 저장/초기화 버튼

### 2. Modified Files

- `frontend/src/App.tsx`: 라우팅 추가 (`/project/:projectId/learning-data-management`)
- `frontend/src/views/LayoutView.tsx`: 네비게이션 메뉴 추가 (Storage 아이콘)
- `frontend/src/pages/ProjectDashboardPage.tsx`: 대시보드 카드 추가 (녹색 테마)

### 3. Frontend Workflow

```
1. 페이지 로드
   └─> LearningDataService.getROIFileList()
   └─> LearningDataService.getLearningFolders()

2. ROI 파일 선택
   └─> LearningDataService.getROIFileData(projectId, roiFileName)

3. 학습 폴더 선택
   └─> LearningDataService.getCCTVList(projectId, folderPath)

4. CCTV 선택
   └─> LearningDataService.getFirstImage(projectId, folderPath, cctvId, imageFile)

5. ROI 클릭 → 점유 상태 토글 (프론트엔드에서만 처리)

6. 저장 버튼 클릭
   └─> Canvas API로 ROI 영역을 흰색으로 채운 이미지 생성
   └─> LearningDataService.saveEditedImage()
       └─> 원본 이미지에 덮어쓰기
```

---

## 🔧 Backend API Requirements (❌ Not Implemented)

### API Endpoint Specifications

프론트엔드에서 사용하는 API 엔드포인트와 요구사항입니다.

---

### 1. ROI 파일 목록 조회

**Endpoint**: `GET /v0.1/filestorage/{projectId}/roi/folders`

**Purpose**: ROI JSON 파일 목록을 조회합니다.

**Response**:
```json
{
  "success": true,
  "message": "Folders retrieved successfully",
  "data": {
    "folders": [
      {
        "name": "root",
        "path": "",
        "files": [
          {
            "name": "P1_B2_3.json",
            "size": 1024,
            "created_at": "2025-01-01T00:00:00Z"
          }
        ],
        "subfolders": [],
        "file_count": 1,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

**Implementation Notes**:
- 기존 FileStorage API의 `LIST_FOLDERS` 엔드포인트 사용
- `category = "roi"` 카테고리의 파일 목록 반환
- JSON 파일만 필터링하여 반환

---

### 2. ROI 파일 데이터 조회

**Endpoint**: `GET /v0.1/filestorage/{projectId}/roi/latest?original_name={filename}`

**Purpose**: 특정 ROI JSON 파일의 최신 버전 데이터를 조회합니다.

**Query Parameters**:
- `original_name`: ROI 파일명 (예: `P1_B2_3.json`)

**Response**:
```json
{
  "cctv_id": "P1_B2_3",
  "rois": [
    {
      "roi_id": "ROI_01",
      "coords": [100, 100, 200, 100, 200, 200, 100, 200]
    },
    {
      "roi_id": "ROI_02",
      "coords": [300, 100, 400, 100, 400, 200, 300, 200]
    }
  ],
  "image_width": 1920,
  "image_height": 1080
}
```

**Implementation Notes**:
- 기존 FileStorage API의 `DOWNLOAD_LATEST` 엔드포인트 사용
- ROI JSON 파일의 최신 버전을 반환
- 파일 내용을 JSON으로 파싱하여 반환

---

### 3. 학습 폴더 목록 조회

**Endpoint**: `GET /v0.1/filestorage/{projectId}/learning/folders`

**Purpose**: 학습 데이터 폴더 구조를 조회합니다.

**Response**:
```json
{
  "success": true,
  "message": "Folders retrieved successfully",
  "data": {
    "folders": [
      {
        "name": "2025-01-01_10-30-00",
        "path": "2025-01-01_10-30-00",
        "files": [],
        "subfolders": [
          {
            "name": "P1_B2_3",
            "path": "2025-01-01_10-30-00/P1_B2_3",
            "files": [
              {
                "name": "image_001.jpg",
                "size": 102400,
                "created_at": "2025-01-01T10:30:00Z"
              },
              {
                "name": "image_002.jpg",
                "size": 103400,
                "created_at": "2025-01-01T10:31:00Z"
              }
            ],
            "file_count": 2,
            "created_at": "2025-01-01T10:30:00Z"
          },
          {
            "name": "P1_B2_4",
            "path": "2025-01-01_10-30-00/P1_B2_4",
            "files": [
              {
                "name": "image_001.jpg",
                "size": 105400,
                "created_at": "2025-01-01T10:30:00Z"
              }
            ],
            "file_count": 1,
            "created_at": "2025-01-01T10:30:00Z"
          }
        ],
        "file_count": 0,
        "created_at": "2025-01-01T10:30:00Z"
      }
    ]
  }
}
```

**Implementation Notes**:
- 기존 FileStorage API의 `LIST_FOLDERS` 엔드포인트 사용
- `category = "learning"` 카테고리의 폴더 구조 반환
- 폴더 내 CCTV별 서브폴더 구조 포함 (`subfolders`)
- 각 CCTV 서브폴더의 이미지 파일 목록 포함

**Expected Folder Structure**:
```
/shared/{projectId}/uploads/learningImages/
  └── 2025-01-01_10-30-00/          # 학습 폴더 (타임스탬프)
      ├── P1_B2_3/                   # CCTV ID
      │   ├── image_001.jpg
      │   └── image_002.jpg
      └── P1_B2_4/                   # CCTV ID
          └── image_001.jpg
```

---

### 4. 이미지 다운로드

**Endpoint**: `GET /v0.1/filestorage/{projectId}/learning/download/{folderPath}/{cctvId}/{imageFile}`

**Purpose**: 특정 학습 이미지를 다운로드합니다.

**Path Parameters**:
- `folderPath`: 학습 폴더 경로 (예: `2025-01-01_10-30-00`)
- `cctvId`: CCTV ID (예: `P1_B2_3`)
- `imageFile`: 이미지 파일명 (예: `image_001.jpg`)

**Full Path Example**:
```
GET /v0.1/filestorage/banpo/learning/download/2025-01-01_10-30-00/P1_B2_3/image_001.jpg
```

**Response**:
- Content-Type: `image/jpeg`
- Binary image data

**Implementation Notes**:
- 기존 FileStorage API의 `DOWNLOAD` 엔드포인트 사용
- 전체 경로를 URL 인코딩하여 전달 (슬래시는 보존)
- 이미지 파일을 blob으로 반환

---

### 5. 편집된 이미지 저장 (덮어쓰기)

**Endpoint**: `POST /v0.1/filestorage/{projectId}/learning/upload?folder_path={folderPath}/{cctvId}`

**Purpose**: 편집된 이미지를 원본 위치에 덮어씁니다.

**Query Parameters**:
- `folder_path`: 저장 경로 (예: `2025-01-01_10-30-00/P1_B2_3`)

**Request**:
- Content-Type: `multipart/form-data`
- Body:
  ```
  file: [Binary image data] (파일명: image_001.jpg)
  ```

**Response**:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "total_files": 1,
    "success_count": 1,
    "failed_count": 0,
    "uploaded_files": [
      {
        "filename": "image_001_v1234567890.jpg",
        "original_name": "image_001.jpg",
        "version": "1234567890",
        "size_bytes": 153600,
        "upload_date": "2025-01-01T12:00:00Z",
        "file_type": "image/jpeg",
        "path": "/shared/banpo/uploads/learningImages/2025-01-01_10-30-00/P1_B2_3/image_001_v1234567890.jpg"
      }
    ]
  }
}
```

**Implementation Notes**:
- 기존 FileStorage API의 `UPLOAD` 엔드포인트 사용
- `folder_path` 쿼리 파라미터로 저장 위치 지정
- 파일 버전 관리 시스템 사용 (자동으로 `_v{timestamp}` 추가)
- **중요**: 원본 파일을 덮어쓰는 것처럼 동작하되, 실제로는 버전을 추가하여 백업 유지
- 프론트엔드에서는 최신 버전을 조회할 때 항상 최신 파일을 가져오므로 투명하게 동작

**Alternative Implementation (True Overwrite)**:
만약 진짜 덮어쓰기가 필요하다면:
1. 기존 파일 삭제: `DELETE /v0.1/filestorage/{projectId}/learning/delete/{path}`
2. 새 파일 업로드: `POST /v0.1/filestorage/{projectId}/learning/upload`

---

## 🔄 Data Flow

### Frontend → Backend Flow

```
[사용자 액션]                [Frontend]                           [Backend API]

1. 페이지 진입
                        │
                        ├─> getROIFileList()
                        │                                   GET /filestorage/{id}/roi/folders
                        │                                   └─> ROI 파일 목록 반환
                        │
                        ├─> getLearningFolders()
                        │                                   GET /filestorage/{id}/learning/folders
                        │                                   └─> 학습 폴더 구조 반환
                        │

2. ROI 파일 선택: "P1_B2_3.json"
                        │
                        ├─> getROIFileData(projectId, "P1_B2_3.json")
                        │                                   GET /filestorage/{id}/roi/latest?original_name=P1_B2_3.json
                        │                                   └─> ROI 좌표 데이터 반환
                        │

3. 학습 폴더 선택: "2025-01-01_10-30-00"
                        │
                        ├─> getCCTVList(projectId, "2025-01-01_10-30-00")
                        │                                   GET /filestorage/{id}/learning/folders
                        │                                   └─> 해당 폴더의 CCTV 목록 반환
                        │

4. CCTV 선택: "P1_B2_3"
                        │
                        ├─> getFirstImage(projectId, "2025-01-01_10-30-00", "P1_B2_3", "image_001.jpg")
                        │                                   GET /filestorage/{id}/learning/download/2025-01-01_10-30-00/P1_B2_3/image_001.jpg
                        │                                   └─> 이미지 blob 반환
                        │

5. ROI 클릭 → 점유 상태 토글
                        │
                        └─> (프론트엔드에서만 처리, API 호출 없음)

6. 저장 버튼 클릭
                        │
                        ├─> Canvas API로 ROI 영역을 흰색으로 채운 이미지 생성
                        │
                        └─> saveEditedImage(request)
                                                            POST /filestorage/{id}/learning/upload?folder_path=2025-01-01_10-30-00/P1_B2_3
                                                            Body: FormData { file: image_001.jpg }
                                                            └─> 원본 위치에 저장 (버전 관리)
```

---

## 🛠 Backend Implementation Tasks

### Task 1: Verify Existing FileStorage API

기존 FileStorage API가 다음 엔드포인트를 지원하는지 확인:

1. ✅ `GET /v0.1/filestorage/{projectId}/{category}/folders`
   - `category = "roi"` 지원 여부
   - `category = "learning"` 지원 여부
   - 서브폴더 구조 반환 여부 (`subfolders` 필드)

2. ✅ `GET /v0.1/filestorage/{projectId}/{category}/latest?original_name={filename}`
   - ROI JSON 파일 다운로드 지원 여부
   - JSON 파싱 후 반환 여부

3. ✅ `GET /v0.1/filestorage/{projectId}/{category}/download/{filepath}`
   - 중첩된 경로 지원 여부 (예: `2025-01-01_10-30-00/P1_B2_3/image_001.jpg`)
   - 이미지 blob 반환 여부

4. ✅ `POST /v0.1/filestorage/{projectId}/{category}/upload?folder_path={path}`
   - `folder_path` 쿼리 파라미터 지원 여부
   - 파일 버전 관리 지원 여부

---

### Task 2: Implement Missing Features

기존 API에서 누락된 기능 구현:

#### 2-1. ROI 카테고리 지원

**File**: `backend/src/features/filestorage/handler/listFoldersHandler.go`

**Required Changes**:
```go
// Ensure "roi" category is supported
func (h *ListFoldersHandler) Handle(c echo.Context) error {
    category := c.Param("category")

    // Validate category
    validCategories := []string{"map", "cad", "roi", "learning", "test"}
    if !contains(validCategories, category) {
        return c.JSON(http.StatusBadRequest, map[string]interface{}{
            "success": false,
            "message": "Invalid category. Allowed: map, cad, roi, learning, test",
        })
    }

    // ... rest of implementation
}
```

**Storage Path**:
- ROI 파일 저장 위치: `/shared/{projectId}/uploads/roi/`
- 구조: 평평한 구조 (하위 폴더 없음, JSON 파일만)

---

#### 2-2. Learning 폴더 서브폴더 구조 반환

**File**: `backend/src/features/filestorage/handler/listFoldersHandler.go`

**Required Changes**:
```go
type FolderNode struct {
    Name       string       `json:"name"`
    Path       string       `json:"path"`
    Files      []FileInfo   `json:"files"`
    Subfolders []FolderNode `json:"subfolders"` // 서브폴더 추가
    FileCount  int          `json:"file_count"`
    CreatedAt  string       `json:"created_at"`
}

func (h *ListFoldersHandler) Handle(c echo.Context) error {
    // ... existing code ...

    // For "learning" category, scan subfolders (CCTV directories)
    if category == "learning" {
        for _, folder := range folders {
            cctvDirs, _ := ioutil.ReadDir(filepath.Join(basePath, folder.Name))
            for _, cctvDir := range cctvDirs {
                if cctvDir.IsDir() {
                    cctvPath := filepath.Join(folder.Name, cctvDir.Name())
                    images := scanImagesInDir(filepath.Join(basePath, cctvPath))

                    folder.Subfolders = append(folder.Subfolders, FolderNode{
                        Name:      cctvDir.Name(),
                        Path:      cctvPath,
                        Files:     images,
                        FileCount: len(images),
                        CreatedAt: cctvDir.ModTime().Format(time.RFC3339),
                    })
                }
            }
        }
    }

    // ... return response
}
```

**Storage Path**:
- 학습 데이터 저장 위치: `/shared/{projectId}/uploads/learningImages/`
- 구조:
  ```
  learningImages/
    └── {timestamp}/         # 학습 폴더
        ├── {cctvId}/        # CCTV별 서브폴더
        │   ├── image_001.jpg
        │   └── image_002.jpg
        └── {cctvId}/
            └── image_001.jpg
  ```

---

#### 2-3. ROI JSON 파일 다운로드 및 파싱

**File**: `backend/src/features/filestorage/handler/downloadLatestHandler.go`

**Required Changes**:
```go
func (h *DownloadLatestHandler) Handle(c echo.Context) error {
    category := c.Param("category")
    originalName := c.QueryParam("original_name")

    // ... find latest version file ...

    // For JSON files, parse and return as JSON
    if filepath.Ext(latestFile.Filename) == ".json" {
        data, err := ioutil.ReadFile(latestFile.Path)
        if err != nil {
            return c.JSON(http.StatusInternalServerError, map[string]interface{}{
                "success": false,
                "message": "Failed to read JSON file",
            })
        }

        var jsonData map[string]interface{}
        if err := json.Unmarshal(data, &jsonData); err != nil {
            return c.JSON(http.StatusInternalServerError, map[string]interface{}{
                "success": false,
                "message": "Failed to parse JSON file",
            })
        }

        return c.JSON(http.StatusOK, jsonData)
    }

    // For other files, return as blob
    return c.File(latestFile.Path)
}
```

---

#### 2-4. 중첩 경로 다운로드 지원

**File**: `backend/src/features/filestorage/handler/downloadHandler.go`

**Required Changes**:
```go
func (h *DownloadHandler) Handle(c echo.Context) error {
    projectId := c.Param("projectId")
    category := c.Param("category")
    filename := c.Param("*") // Capture full path with wildcards

    // Construct full path
    basePath := filepath.Join("/shared", projectId, "uploads", getCategoryPath(category))
    fullPath := filepath.Join(basePath, filename)

    // Security check: prevent path traversal
    if !strings.HasPrefix(fullPath, basePath) {
        return c.JSON(http.StatusForbidden, map[string]interface{}{
            "success": false,
            "message": "Invalid file path",
        })
    }

    // Check file exists
    if _, err := os.Stat(fullPath); os.IsNotExist(err) {
        return c.JSON(http.StatusNotFound, map[string]interface{}{
            "success": false,
            "message": "File not found",
        })
    }

    return c.File(fullPath)
}

func getCategoryPath(category string) string {
    switch category {
    case "map":
        return "maps"
    case "cad":
        return "cad"
    case "roi":
        return "roi"
    case "learning":
        return "learningImages"
    case "test":
        return "testImages"
    default:
        return category
    }
}
```

**Route Configuration**:
```go
// In routes setup
e.GET("/v0.1/filestorage/:projectId/:category/download/*", downloadHandler.Handle)
```

---

#### 2-5. folder_path 쿼리 파라미터 지원

**File**: `backend/src/features/filestorage/handler/uploadHandler.go`

**Required Changes**:
```go
func (h *UploadHandler) Handle(c echo.Context) error {
    projectId := c.Param("projectId")
    category := c.Param("category")
    folderPath := c.QueryParam("folder_path") // 추가

    // ... parse multipart form ...

    for _, fileHeader := range files {
        // Determine save path
        var savePath string
        if folderPath != "" {
            // Use provided folder_path
            savePath = filepath.Join(basePath, folderPath, fileHeader.Filename)
        } else {
            // Use default logic (preserve folder structure from upload)
            savePath = filepath.Join(basePath, fileHeader.Filename)
        }

        // Create directories if needed
        if err := os.MkdirAll(filepath.Dir(savePath), 0755); err != nil {
            return err
        }

        // Save file with versioning
        versionedPath := addVersionToFilename(savePath)
        if err := saveFile(fileHeader, versionedPath); err != nil {
            return err
        }

        // ... record metadata ...
    }

    // ... return response
}
```

---

### Task 3: Testing Checklist

백엔드 구현 후 다음 테스트 수행:

#### 3-1. ROI 파일 목록 조회
```bash
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/roi/folders"
```
Expected: ROI JSON 파일 목록 반환

#### 3-2. ROI 파일 데이터 조회
```bash
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/roi/latest?original_name=P1_B2_3.json"
```
Expected: JSON 파싱된 ROI 데이터 반환

#### 3-3. 학습 폴더 구조 조회
```bash
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/learning/folders"
```
Expected: 학습 폴더 + CCTV 서브폴더 구조 반환

#### 3-4. 이미지 다운로드
```bash
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/learning/download/2025-01-01_10-30-00/P1_B2_3/image_001.jpg" --output test.jpg
```
Expected: 이미지 파일 다운로드

#### 3-5. 이미지 업로드 (덮어쓰기)
```bash
curl -X POST "http://localhost:5000/v0.1/filestorage/banpo/learning/upload?folder_path=2025-01-01_10-30-00/P1_B2_3" \
  -F "file=@test_edited.jpg"
```
Expected: 파일 저장 성공, 버전 관리

---

## 📊 Database Schema (If Needed)

현재 FileStorage는 파일 시스템 기반이므로 추가 DB 스키마는 불필요합니다.
단, 파일 메타데이터를 DB에 저장하는 경우:

```sql
-- File metadata tracking (optional enhancement)
CREATE TABLE IF NOT EXISTS file_metadata (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    cctv_id VARCHAR(100),
    folder_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project_category (project_id, category),
    INDEX idx_original_name (original_name),
    INDEX idx_cctv_id (cctv_id)
);
```

---

## 🚀 Deployment Considerations

### 1. File System Requirements

**Storage Structure**:
```
/shared/{projectId}/uploads/
├── roi/
│   ├── P1_B2_3.json
│   ├── P1_B2_3_v1234567890.json (versioned)
│   └── P1_B2_4.json
└── learningImages/
    ├── 2025-01-01_10-30-00/
    │   ├── P1_B2_3/
    │   │   ├── image_001.jpg
    │   │   ├── image_001_v1234567890.jpg (versioned)
    │   │   └── image_002.jpg
    │   └── P1_B2_4/
    │       └── image_001.jpg
    └── 2025-01-02_15-45-00/
        └── ...
```

### 2. Permissions

```bash
# Ensure proper permissions
chmod -R 755 /shared/{projectId}/uploads/roi
chmod -R 755 /shared/{projectId}/uploads/learningImages
```

### 3. Docker Volume Mounts

**docker-compose.yml**:
```yaml
services:
  backend:
    volumes:
      - ./shared:/shared
```

### 4. CORS Configuration

프론트엔드가 별도 도메인에서 실행되는 경우 CORS 설정 필요:

```go
// main.go
e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
    AllowOrigins: []string{"http://localhost:3000", "http://192.168.0.102:3000"},
    AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
}))
```

---

## 🐛 Known Issues & Edge Cases

### 1. ROI 파일과 CCTV ID 불일치
**Issue**: 선택한 ROI 파일의 `cctv_id`와 선택한 CCTV ID가 다를 수 있음

**Solution**:
- 프론트엔드: ROI 파일 선택 시 `cctv_id` 검증
- 백엔드: ROI 데이터에 항상 `cctv_id` 포함

### 2. 빈 학습 폴더
**Issue**: CCTV 서브폴더가 없는 학습 폴더 존재 가능

**Solution**:
- 프론트엔드: 빈 폴더 선택 시 안내 메시지 표시
- 백엔드: `cctv_count: 0` 반환

### 3. 이미지 파일 형식
**Issue**: JPG, PNG, JPEG 등 다양한 형식 지원 필요

**Solution**:
- 백엔드: 이미지 MIME 타입 검증 (`image/jpeg`, `image/png`)
- 프론트엔드: Canvas API는 모든 이미지 형식 지원

### 4. 대용량 이미지
**Issue**: 4K 이미지 등 대용량 파일 처리

**Solution**:
- 백엔드: 파일 크기 제한 설정 (예: 10MB)
- 프론트엔드: Canvas 크기 제한 (800x600)

---

## 📝 Code Review Checklist

### Backend Implementation Review

- [ ] ROI 카테고리 지원 확인
- [ ] Learning 카테고리 서브폴더 구조 반환 확인
- [ ] JSON 파일 파싱 후 반환 확인
- [ ] 중첩 경로 다운로드 지원 확인
- [ ] `folder_path` 쿼리 파라미터 처리 확인
- [ ] 파일 버전 관리 동작 확인
- [ ] 경로 트래버설 공격 방어 확인
- [ ] 에러 핸들링 적절성 확인
- [ ] 로깅 추가 확인

### Integration Testing

- [ ] 프론트엔드 → 백엔드 전체 플로우 테스트
- [ ] ROI 파일 선택 → 데이터 로드 확인
- [ ] 학습 폴더 선택 → CCTV 목록 로드 확인
- [ ] CCTV 선택 → 이미지 표시 확인
- [ ] ROI 클릭 → 상태 토글 확인
- [ ] 저장 → 이미지 덮어쓰기 확인
- [ ] 에러 시나리오 테스트 (파일 없음, 권한 없음 등)

---

## 🎓 Summary for Backend Developer

안녕하세요! 프론트엔드 개발자입니다.

**학습 데이터 관리 기능**의 프론트엔드 구현이 완료되었습니다.
이 기능은 ROI 파일과 학습 이미지를 선택하여 주차면에 차량 점유 상태를 표시하는 기능입니다.

### 당신이 해야 할 일:

1. **기존 FileStorage API 확인**
   - `/v0.1/filestorage/{projectId}/{category}/folders`
   - `/v0.1/filestorage/{projectId}/{category}/latest`
   - `/v0.1/filestorage/{projectId}/{category}/download/{path}`
   - `/v0.1/filestorage/{projectId}/{category}/upload`

2. **누락된 기능 구현**
   - ROI 카테고리 지원 추가
   - Learning 폴더의 서브폴더 구조 반환
   - JSON 파일 파싱 후 반환
   - 중첩 경로 다운로드 지원
   - `folder_path` 쿼리 파라미터 처리

3. **테스트**
   - 위의 "Testing Checklist" 참고
   - 프론트엔드와 통합 테스트

### 프론트엔드에서 호출하는 API:

1. `GET /v0.1/filestorage/{projectId}/roi/folders` - ROI 파일 목록
2. `GET /v0.1/filestorage/{projectId}/roi/latest?original_name={filename}` - ROI 데이터
3. `GET /v0.1/filestorage/{projectId}/learning/folders` - 학습 폴더 구조
4. `GET /v0.1/filestorage/{projectId}/learning/download/{path}` - 이미지 다운로드
5. `POST /v0.1/filestorage/{projectId}/learning/upload?folder_path={path}` - 이미지 저장

### 참고 자료:

- 이 문서의 "Backend API Requirements" 섹션
- 각 엔드포인트의 요청/응답 스펙
- 예상되는 폴더 구조

질문이 있으면 언제든지 물어보세요! 🚀
