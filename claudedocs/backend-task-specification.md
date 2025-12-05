# Backend Task Specification - Learning Data Management API

## 📋 Task Overview

**Feature**: Learning Data Management Backend API
**Priority**: High
**Estimated Effort**: 4-6 hours
**Dependencies**: Existing FileStorage API implementation

---

## 🎯 Objective

기존 FileStorage API를 확장하여 학습 데이터 관리 기능을 지원합니다.
프론트엔드에서 ROI 파일과 학습 데이터를 선택하고, 편집된 이미지를 저장할 수 있도록 API를 구현합니다.

---

## 📦 Deliverables

### 1. API Endpoints (5개)

- [x] `GET /v0.1/filestorage/{projectId}/roi/folders` - ROI 파일 목록 조회
- [x] `GET /v0.1/filestorage/{projectId}/roi/latest?original_name={filename}` - ROI 파일 데이터 조회
- [x] `GET /v0.1/filestorage/{projectId}/learning/folders` - 학습 폴더 구조 조회
- [x] `GET /v0.1/filestorage/{projectId}/learning/download/*` - 이미지 다운로드
- [x] `POST /v0.1/filestorage/{projectId}/learning/upload?folder_path={path}` - 이미지 저장

### 2. File Structure Support

- [x] ROI 카테고리 지원
- [x] Learning 카테고리 서브폴더 구조 반환
- [x] 중첩 경로 다운로드
- [x] folder_path 쿼리 파라미터 처리

### 3. Data Formats

- [x] JSON 파일 파싱 후 반환
- [x] 이미지 blob 반환
- [x] 폴더 구조 JSON 반환

---

## 🔧 Implementation Steps

### Step 1: Verify Existing Implementation (30분)

**Files to Check**:
```
backend/src/features/filestorage/
├── handler/
│   ├── listFoldersHandler.go
│   ├── downloadLatestHandler.go
│   ├── downloadHandler.go
│   └── uploadHandler.go
├── usecase/
│   ├── listFoldersUseCase.go
│   ├── downloadLatestUseCase.go
│   ├── downloadUseCase.go
│   └── uploadUseCase.go
└── repository/
    └── fileStorageRepository.go
```

**Verification Checklist**:
- [ ] FileStorage API 기본 구조 확인
- [ ] 카테고리 지원 현황 확인 (map, cad, roi?, learning?, test?)
- [ ] 폴더 구조 반환 로직 확인 (subfolders 지원 여부)
- [ ] 파일 다운로드 로직 확인 (중첩 경로 지원 여부)
- [ ] 파일 업로드 로직 확인 (folder_path 파라미터 지원 여부)

---

### Step 2: Add ROI Category Support (1시간)

**Goal**: ROI 카테고리를 FileStorage에 추가

#### 2-1. Category Validation

**File**: `backend/src/features/filestorage/handler/listFoldersHandler.go`

```go
func (h *ListFoldersHandler) Handle(c echo.Context) error {
    projectId := c.Param("projectId")
    category := c.Param("category")

    // Validate category - ADD "roi" here
    validCategories := []string{"map", "cad", "roi", "learning", "test"}
    if !contains(validCategories, category) {
        return c.JSON(http.StatusBadRequest, Response{
            Success: false,
            Message: fmt.Sprintf("Invalid category. Allowed: %v", validCategories),
        })
    }

    // ... continue with existing logic
}
```

#### 2-2. ROI File Path Mapping

**File**: `backend/src/features/filestorage/util/pathHelper.go` (create if not exists)

```go
func GetCategoryBasePath(projectId, category string) string {
    baseUploadPath := filepath.Join("/shared", projectId, "uploads")

    switch category {
    case "map":
        return filepath.Join(baseUploadPath, "maps")
    case "cad":
        return filepath.Join(baseUploadPath, "cad")
    case "roi":
        return filepath.Join(baseUploadPath, "roi")  // ADD THIS
    case "learning":
        return filepath.Join(baseUploadPath, "learningImages")
    case "test":
        return filepath.Join(baseUploadPath, "testImages")
    default:
        return filepath.Join(baseUploadPath, category)
    }
}
```

**Test**:
```bash
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/roi/folders"
```

Expected Response:
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
        ]
      }
    ]
  }
}
```

---

### Step 3: Add Subfolder Support for Learning Category (1.5시간)

**Goal**: Learning 카테고리에서 CCTV 서브폴더 구조 반환

#### 3-1. Update FolderNode Model

**File**: `backend/src/features/filestorage/model/response/folderList.go`

```go
type FolderNode struct {
    Name       string       `json:"name"`
    Path       string       `json:"path"`
    Files      []FileInfo   `json:"files"`
    Subfolders []FolderNode `json:"subfolders"` // ADD THIS FIELD
    FileCount  int          `json:"file_count"`
    CreatedAt  string       `json:"created_at"`
}
```

#### 3-2. Scan Subfolders for Learning Category

**File**: `backend/src/features/filestorage/usecase/listFoldersUseCase.go`

```go
func (uc *ListFoldersUseCase) Execute(projectId, category string) (*response.FolderListResponse, error) {
    basePath := util.GetCategoryBasePath(projectId, category)

    // Scan root folders
    rootFolders, err := uc.scanFolders(basePath, "")
    if err != nil {
        return nil, err
    }

    // For "learning" category, scan CCTV subfolders
    if category == "learning" {
        for i := range rootFolders {
            cctvFolders, err := uc.scanFolders(basePath, rootFolders[i].Name)
            if err != nil {
                continue // Skip if error
            }
            rootFolders[i].Subfolders = cctvFolders
        }
    }

    return &response.FolderListResponse{
        Success: true,
        Message: "Folders retrieved successfully",
        Data: response.FolderListData{
            Folders: rootFolders,
        },
    }, nil
}

func (uc *ListFoldersUseCase) scanFolders(basePath, parentPath string) ([]response.FolderNode, error) {
    scanPath := filepath.Join(basePath, parentPath)
    entries, err := ioutil.ReadDir(scanPath)
    if err != nil {
        return nil, err
    }

    var folders []response.FolderNode
    for _, entry := range entries {
        if entry.IsDir() {
            folderPath := filepath.Join(parentPath, entry.Name())
            files := uc.scanFilesInFolder(basePath, folderPath)

            folders = append(folders, response.FolderNode{
                Name:       entry.Name(),
                Path:       folderPath,
                Files:      files,
                Subfolders: []response.FolderNode{}, // Initialize empty
                FileCount:  len(files),
                CreatedAt:  entry.ModTime().Format(time.RFC3339),
            })
        }
    }

    return folders, nil
}

func (uc *ListFoldersUseCase) scanFilesInFolder(basePath, folderPath string) []response.FileInfo {
    scanPath := filepath.Join(basePath, folderPath)
    entries, err := ioutil.ReadDir(scanPath)
    if err != nil {
        return []response.FileInfo{}
    }

    var files []response.FileInfo
    for _, entry := range entries {
        if !entry.IsDir() {
            files = append(files, response.FileInfo{
                Name:      entry.Name(),
                Size:      entry.Size(),
                CreatedAt: entry.ModTime().Format(time.RFC3339),
            })
        }
    }

    return files
}
```

**Test**:
```bash
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/learning/folders"
```

Expected Response:
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
              {"name": "image_001.jpg", "size": 102400, "created_at": "..."}
            ],
            "file_count": 1,
            "created_at": "..."
          }
        ],
        "file_count": 0,
        "created_at": "..."
      }
    ]
  }
}
```

---

### Step 4: Add JSON Parsing for ROI Files (30분)

**Goal**: ROI JSON 파일을 파싱하여 반환

#### 4-1. Check File Extension and Parse JSON

**File**: `backend/src/features/filestorage/handler/downloadLatestHandler.go`

```go
func (h *DownloadLatestHandler) Handle(c echo.Context) error {
    projectId := c.Param("projectId")
    category := c.Param("category")
    originalName := c.QueryParam("original_name")

    // Get latest file from usecase
    latestFile, err := h.useCase.GetLatestFile(projectId, category, originalName)
    if err != nil {
        return c.JSON(http.StatusNotFound, Response{
            Success: false,
            Message: "File not found",
        })
    }

    // Check if JSON file
    if filepath.Ext(latestFile.Path) == ".json" {
        // Read and parse JSON
        data, err := ioutil.ReadFile(latestFile.Path)
        if err != nil {
            return c.JSON(http.StatusInternalServerError, Response{
                Success: false,
                Message: "Failed to read JSON file",
            })
        }

        // Parse JSON
        var jsonData map[string]interface{}
        if err := json.Unmarshal(data, &jsonData); err != nil {
            return c.JSON(http.StatusInternalServerError, Response{
                Success: false,
                Message: "Failed to parse JSON file",
            })
        }

        // Return parsed JSON
        return c.JSON(http.StatusOK, jsonData)
    }

    // For non-JSON files, return as file
    return c.File(latestFile.Path)
}
```

**Test**:
```bash
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/roi/latest?original_name=P1_B2_3.json"
```

Expected Response:
```json
{
  "cctv_id": "P1_B2_3",
  "rois": [
    {
      "roi_id": "ROI_01",
      "coords": [100, 100, 200, 100, 200, 200, 100, 200]
    }
  ],
  "image_width": 1920,
  "image_height": 1080
}
```

---

### Step 5: Support Nested Path Download (1시간)

**Goal**: 중첩된 경로에서 파일 다운로드 지원

#### 5-1. Update Route to Use Wildcard

**File**: `backend/src/features/filestorage/handler/index.go`

```go
func RegisterRoutes(e *echo.Echo, handlers *Handlers) {
    // ... existing routes ...

    // Change from single param to wildcard
    e.GET("/v0.1/filestorage/:projectId/:category/download/*", handlers.Download.Handle)
}
```

#### 5-2. Extract Full Path from Wildcard

**File**: `backend/src/features/filestorage/handler/downloadHandler.go`

```go
func (h *DownloadHandler) Handle(c echo.Context) error {
    projectId := c.Param("projectId")
    category := c.Param("category")
    filePath := c.Param("*") // Capture everything after /download/

    // Construct full path
    basePath := util.GetCategoryBasePath(projectId, category)
    fullPath := filepath.Join(basePath, filePath)

    // Security: Prevent path traversal attack
    if !strings.HasPrefix(filepath.Clean(fullPath), basePath) {
        return c.JSON(http.StatusForbidden, Response{
            Success: false,
            Message: "Invalid file path",
        })
    }

    // Check file exists
    fileInfo, err := os.Stat(fullPath)
    if os.IsNotExist(err) {
        return c.JSON(http.StatusNotFound, Response{
            Success: false,
            Message: "File not found",
        })
    }

    if fileInfo.IsDir() {
        return c.JSON(http.StatusBadRequest, Response{
            Success: false,
            Message: "Path is a directory, not a file",
        })
    }

    // Return file
    return c.File(fullPath)
}
```

**Test**:
```bash
# Test nested path
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/learning/download/2025-01-01_10-30-00/P1_B2_3/image_001.jpg" \
  --output test_download.jpg

# Verify file downloaded
file test_download.jpg
# Expected: test_download.jpg: JPEG image data...
```

---

### Step 6: Support folder_path Query Parameter (1시간)

**Goal**: 업로드 시 folder_path 파라미터로 저장 위치 지정

#### 6-1. Parse folder_path Query Parameter

**File**: `backend/src/features/filestorage/handler/uploadHandler.go`

```go
func (h *UploadHandler) Handle(c echo.Context) error {
    projectId := c.Param("projectId")
    category := c.Param("category")
    folderPath := c.QueryParam("folder_path") // ADD THIS

    // Parse multipart form
    form, err := c.MultipartForm()
    if err != nil {
        return c.JSON(http.StatusBadRequest, Response{
            Success: false,
            Message: "Failed to parse multipart form",
        })
    }

    files := form.File["file"]
    if len(files) == 0 {
        files = form.File["files"]
    }

    basePath := util.GetCategoryBasePath(projectId, category)
    var uploadedFiles []response.FileInfo

    for _, fileHeader := range files {
        // Determine save path
        var targetPath string
        if folderPath != "" {
            // Use provided folder_path
            targetPath = filepath.Join(basePath, folderPath, fileHeader.Filename)
        } else {
            // Use default behavior (extract from Content-Disposition or use filename)
            relativePath := extractRelativePath(fileHeader)
            targetPath = filepath.Join(basePath, relativePath)
        }

        // Create directories if needed
        targetDir := filepath.Dir(targetPath)
        if err := os.MkdirAll(targetDir, 0755); err != nil {
            return c.JSON(http.StatusInternalServerError, Response{
                Success: false,
                Message: fmt.Sprintf("Failed to create directory: %v", err),
            })
        }

        // Add version to filename (existing logic)
        versionedPath := addVersionSuffix(targetPath)

        // Save file
        if err := saveUploadedFile(fileHeader, versionedPath); err != nil {
            return c.JSON(http.StatusInternalServerError, Response{
                Success: false,
                Message: fmt.Sprintf("Failed to save file: %v", err),
            })
        }

        // Record file info
        fileInfo := response.FileInfo{
            Name:      filepath.Base(versionedPath),
            Size:      fileHeader.Size,
            CreatedAt: time.Now().Format(time.RFC3339),
        }
        uploadedFiles = append(uploadedFiles, fileInfo)
    }

    return c.JSON(http.StatusOK, response.UploadResponse{
        Success: true,
        Message: "Files uploaded successfully",
        Data: response.UploadData{
            TotalFiles:    len(files),
            SuccessCount:  len(uploadedFiles),
            FailedCount:   0,
            UploadedFiles: uploadedFiles,
        },
    })
}

// Helper function to add version suffix
func addVersionSuffix(filePath string) string {
    ext := filepath.Ext(filePath)
    nameWithoutExt := strings.TrimSuffix(filePath, ext)
    timestamp := time.Now().Unix()
    return fmt.Sprintf("%s_v%d%s", nameWithoutExt, timestamp, ext)
}

// Helper function to save uploaded file
func saveUploadedFile(fileHeader *multipart.FileHeader, targetPath string) error {
    src, err := fileHeader.Open()
    if err != nil {
        return err
    }
    defer src.Close()

    dst, err := os.Create(targetPath)
    if err != nil {
        return err
    }
    defer dst.Close()

    _, err = io.Copy(dst, src)
    return err
}
```

**Test**:
```bash
# Upload to specific folder
curl -X POST "http://localhost:5000/v0.1/filestorage/banpo/learning/upload?folder_path=2025-01-01_10-30-00/P1_B2_3" \
  -F "file=@test_image.jpg"
```

Expected Response:
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": {
    "total_files": 1,
    "success_count": 1,
    "failed_count": 0,
    "uploaded_files": [
      {
        "name": "test_image_v1234567890.jpg",
        "size": 153600,
        "created_at": "2025-01-01T12:00:00Z"
      }
    ]
  }
}
```

---

### Step 7: Integration Testing (1시간)

#### Test Case 1: Full Workflow Test

```bash
#!/bin/bash
# Test script for Learning Data Management API

PROJECT_ID="banpo"
BASE_URL="http://localhost:5000"

echo "=== Test 1: Get ROI Files ==="
curl -X GET "$BASE_URL/v0.1/filestorage/$PROJECT_ID/roi/folders" | jq

echo "\n=== Test 2: Get ROI File Data ==="
curl -X GET "$BASE_URL/v0.1/filestorage/$PROJECT_ID/roi/latest?original_name=P1_B2_3.json" | jq

echo "\n=== Test 3: Get Learning Folders ==="
curl -X GET "$BASE_URL/v0.1/filestorage/$PROJECT_ID/learning/folders" | jq

echo "\n=== Test 4: Download Image ==="
curl -X GET "$BASE_URL/v0.1/filestorage/$PROJECT_ID/learning/download/2025-01-01_10-30-00/P1_B2_3/image_001.jpg" \
  --output test_download.jpg
file test_download.jpg

echo "\n=== Test 5: Upload Edited Image ==="
curl -X POST "$BASE_URL/v0.1/filestorage/$PROJECT_ID/learning/upload?folder_path=2025-01-01_10-30-00/P1_B2_3" \
  -F "file=@test_download.jpg" | jq

echo "\n=== Test Complete ==="
```

#### Test Case 2: Error Scenarios

```bash
# Test invalid category
curl -X GET "$BASE_URL/v0.1/filestorage/$PROJECT_ID/invalid/folders"
# Expected: 400 Bad Request

# Test file not found
curl -X GET "$BASE_URL/v0.1/filestorage/$PROJECT_ID/roi/latest?original_name=nonexistent.json"
# Expected: 404 Not Found

# Test path traversal attack
curl -X GET "$BASE_URL/v0.1/filestorage/$PROJECT_ID/learning/download/../../etc/passwd"
# Expected: 403 Forbidden

# Test empty upload
curl -X POST "$BASE_URL/v0.1/filestorage/$PROJECT_ID/learning/upload"
# Expected: 400 Bad Request
```

---

## 🔍 Code Review Checklist

### Security
- [ ] Path traversal attack prevention (`filepath.Clean` + prefix check)
- [ ] Category validation (whitelist only)
- [ ] File size limits enforced
- [ ] MIME type validation for uploads
- [ ] Error messages don't leak sensitive info

### Performance
- [ ] File operations use buffered I/O
- [ ] Large folder scans are efficient
- [ ] No N+1 queries in folder scanning
- [ ] Proper timeout handling for large file uploads

### Error Handling
- [ ] All errors are logged with context
- [ ] User-friendly error messages
- [ ] Proper HTTP status codes
- [ ] Graceful degradation on missing folders

### Code Quality
- [ ] Functions are single-responsibility
- [ ] Proper naming conventions
- [ ] Sufficient comments for complex logic
- [ ] No code duplication
- [ ] Proper use of Go idioms

---

## 📊 Testing Matrix

| Test Case | Endpoint | Expected Result | Status |
|-----------|----------|-----------------|--------|
| Get ROI files | GET /roi/folders | 200 + JSON list | ⏳ |
| Get ROI data | GET /roi/latest | 200 + parsed JSON | ⏳ |
| Get learning folders | GET /learning/folders | 200 + nested structure | ⏳ |
| Download image | GET /learning/download/* | 200 + image blob | ⏳ |
| Upload image | POST /learning/upload | 200 + file info | ⏳ |
| Invalid category | GET /invalid/folders | 400 + error | ⏳ |
| File not found | GET /roi/latest?original_name=x | 404 + error | ⏳ |
| Path traversal | GET /learning/download/../../etc/passwd | 403 + error | ⏳ |

---

## 🚀 Deployment Steps

### 1. Pre-deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment variables set
- [ ] File permissions verified

### 2. Deployment Commands

```bash
# Build backend
cd backend/src
go build -o main main.go

# Run migrations (if needed)
# ./main migrate

# Restart service
docker-compose restart backend

# Verify deployment
curl http://localhost:5000/v0.1/filestorage/banpo/roi/folders
```

### 3. Post-deployment Verification

```bash
# Run integration tests
./scripts/test-learning-data-api.sh

# Check logs
docker-compose logs -f backend | grep "filestorage"

# Monitor error rate
# Check Grafana/monitoring dashboards
```

---

## 📝 Documentation Updates

### API Documentation

Update Swagger documentation:

**File**: `backend/docs/swagger.yaml`

```yaml
paths:
  /v0.1/filestorage/{projectId}/roi/folders:
    get:
      summary: Get ROI file list
      tags: [FileStorage]
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            type: string
      responses:
        200:
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FolderListResponse'

  /v0.1/filestorage/{projectId}/roi/latest:
    get:
      summary: Get ROI file data
      tags: [FileStorage]
      parameters:
        - name: projectId
          in: path
          required: true
        - name: original_name
          in: query
          required: true
      responses:
        200:
          description: ROI data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ROIFileData'
```

---

## ❓ FAQ

### Q1: 왜 파일을 덮어쓰지 않고 버전을 추가하나요?

**A**: 데이터 안전성을 위해 파일 버전 관리를 사용합니다. 실수로 잘못 저장해도 이전 버전을 복구할 수 있습니다.
프론트엔드에서는 항상 최신 버전을 조회하므로 사용자 입장에서는 투명하게 동작합니다.

### Q2: ROI와 Learning 폴더 구조가 다른 이유는?

**A**:
- ROI: 평평한 구조 (JSON 파일만, CCTV별로 1개 파일)
- Learning: 2단계 구조 (타임스탬프 폴더 > CCTV 폴더 > 이미지들)

각 카테고리의 사용 패턴에 맞게 설계되었습니다.

### Q3: 이미지 크기 제한은 어떻게 설정하나요?

**A**: Echo의 middleware를 사용하여 설정:

```go
e.Use(middleware.BodyLimit("10M")) // 10MB limit
```

### Q4: CORS 문제가 발생하면?

**A**: CORS 설정 확인:

```go
e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
    AllowOrigins: []string{"http://localhost:3000"},
    AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
}))
```

---

## 📞 Support

질문이나 이슈가 있으면 프론트엔드 개발자에게 문의하세요.

- 구현 가이드: `claudedocs/learning-data-management-implementation-guide.md`
- API 스펙: 이 문서의 "Implementation Steps" 섹션
- 프론트엔드 코드: `frontend/src/services/LearningDataService.ts`

**Good luck! 🚀**
