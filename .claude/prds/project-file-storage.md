---
name: project-file-storage
description: Project file storage system with versioning for map/CAD/ROI files and CCTV-organized image folders
status: backlog
created: 2025-10-27T06:57:59Z
---

# PRD: Project File Storage System

## Executive Summary

The project file storage system provides centralized file management for parking management projects. It handles 5 distinct file/folder types with version control for JSON configurations, automatic uploads from the map editor, and CCTV-organized image folders. The system maintains project isolation through `project_id` directories and supports both manual and programmatic file operations.

**Value Proposition**: Eliminates manual file management overhead, prevents configuration loss through versioning, and maintains organized project assets with clear folder structure.

---

## Problem Statement

### Current Pain Points
- No centralized file storage for project-related assets (map JSON, CAD files, ROI configurations, training images)
- Risk of configuration loss when updating map JSON from editor - no version history
- Inconsistent file organization across projects
- Manual file upload/download without structured UI
- No visibility into existing project files

### Why This Matters Now
- Multiple projects (banpo, osong) require consistent file management
- Map editor integration requires automatic upload capability
- CCTV-based parking detection needs organized training/test images by camera ID
- Current manual file management is error-prone and time-consuming

---

## User Stories

### Primary Personas
1. **Project Manager**: Manages overall project files and configurations
2. **System Operator**: Uploads training/test images, downloads results
3. **Map Editor User**: Creates/edits parking maps with automatic JSON upload

### User Journeys

#### Story 1: Map Editor Auto-Upload
**As a** map editor user
**I want** my map JSON to automatically upload when I export from the editor
**So that** I don't have to manually save and upload configuration files

**Acceptance Criteria**:
- Map editor export triggers automatic upload to `shared/{project_id}/map/`
- Previous versions are preserved with timestamp
- Upload happens seamlessly without user intervention
- Validation errors (if any) are silently ignored

#### Story 2: CAD File Management
**As a** project manager
**I want** to upload and download CAD files for each project
**So that** I can maintain architectural drawings alongside parking configurations

**Acceptance Criteria**:
- Upload CAD files to `shared/{project_id}/cad/`
- Download existing CAD files
- View list of available CAD files with metadata (filename, size, upload date)
- Support versioning - new uploads create new versions

#### Story 3: Training Image Folder Upload
**As a** system operator
**I want** to bulk upload training images organized by CCTV ID
**So that** the parking detection algorithm can learn from labeled data

**Acceptance Criteria**:
- Upload folder structure with CCTV IDs (e.g., `P1_B2_1_2/`)
- Frontend chunks large uploads into manageable pieces
- Progress indicator shows upload status
- Files saved to `shared/{project_id}/learning/{cctv_id}/`
- CCTV ID folders auto-created during upload

#### Story 4: ROI JSON Configuration
**As a** system operator
**I want** to upload and download ROI JSON files
**So that** I can configure regions of interest for parking detection

**Acceptance Criteria**:
- Upload ROI JSON to `shared/{project_id}/roi/`
- Download existing ROI configurations
- Version history maintained
- File format validation skipped (accept any JSON)

#### Story 5: Test Image Management
**As a** system operator
**I want** to upload test images organized by CCTV ID
**So that** I can validate detection algorithm performance

**Acceptance Criteria**:
- Upload test images to `shared/{project_id}/test/{cctv_id}/`
- Folder structure matches learning images pattern
- Bulk upload with progress tracking
- Browse existing test images by CCTV ID

#### Story 6: File Browser & Download
**As a** project manager
**I want** to browse all uploaded files for my project
**So that** I can see what assets exist and download them when needed

**Acceptance Criteria**:
- UI displays file tree by category (map/cad/roi/learning/test)
- Click to download individual files
- View file metadata (name, size, version, upload date)
- Filter/search by filename or CCTV ID

---

## Requirements

### Functional Requirements

#### FR1: File Upload System
- **FR1.1**: Accept multipart form data uploads with folder structure preservation
- **FR1.2**: Support chunked uploads from frontend for large files/folders
- **FR1.3**: Create project directories on first upload (`shared/{project_id}/`)
- **FR1.4**: Auto-create CCTV ID subdirectories for learning/test images
- **FR1.5**: Support batch file uploads (multiple files in single request)
- **FR1.6**: Sequential upload processing (no concurrent uploads to avoid conflicts)

#### FR2: File Versioning
- **FR2.1**: Maintain version history for map JSON files
- **FR2.2**: Maintain version history for ROI JSON files
- **FR2.3**: Maintain version history for CAD files
- **FR2.4**: Use timestamp-based versioning (e.g., `map_1698765432.json`)
- **FR2.5**: Keep all versions accessible for download
- **FR2.6**: No automatic version cleanup (unlimited retention)

#### FR3: File Organization
- **FR3.1**: Map JSON files: `shared/{project_id}/map/`
- **FR3.2**: CAD files: `shared/{project_id}/cad/`
- **FR3.3**: Learning images: `shared/{project_id}/learning/{cctv_id}/`
- **FR3.4**: ROI JSON files: `shared/{project_id}/roi/`
- **FR3.5**: Test images: `shared/{project_id}/test/{cctv_id}/`
- **FR3.6**: Preserve original folder structure from upload

#### FR4: Map Editor Integration
- **FR4.1**: Expose upload endpoint for map editor auto-upload
- **FR4.2**: Accept JSON export from map editor
- **FR4.3**: Automatically version uploaded map JSON
- **FR4.4**: Ignore simultaneous upload conflicts (last write wins)
- **FR4.5**: No validation of map JSON format

#### FR5: File Download
- **FR5.1**: Download individual files by path
- **FR5.2**: Stream large files to avoid memory issues
- **FR5.3**: Support range requests for partial downloads
- **FR5.4**: Return appropriate MIME types based on file extension

#### FR6: File Listing & Browser
- **FR6.1**: List all files for a project by category
- **FR6.2**: Return file metadata (name, size, upload timestamp, version)
- **FR6.3**: Support filtering by CCTV ID for learning/test images
- **FR6.4**: Sort files by upload date (newest first)
- **FR6.5**: Pagination for large file lists (100 files per page)

#### FR7: Progress Tracking
- **FR7.1**: Backend accepts chunked uploads with progress metadata
- **FR7.2**: Return upload progress response after each chunk
- **FR7.3**: Frontend responsible for tracking overall progress
- **FR7.4**: No server-side upload session management (stateless)

### Non-Functional Requirements

#### NFR1: Performance
- **NFR1.1**: Handle bulk uploads of 1000+ images efficiently
- **NFR1.2**: File upload throughput: minimum 50MB/s on local network
- **NFR1.3**: File listing response time: <500ms for up to 10,000 files
- **NFR1.4**: Download streaming starts within 100ms

#### NFR2: Storage
- **NFR2.1**: No per-project storage quota limits
- **NFR2.2**: Support file sizes up to 2GB per file
- **NFR2.3**: Frontend chunks uploads >100MB into 10MB pieces
- **NFR2.4**: Efficient disk space usage (no unnecessary copies)

#### NFR3: Reliability
- **NFR3.1**: Failed uploads are ignored (no retry logic)
- **NFR3.2**: Partial folder uploads acceptable (save what succeeds)
- **NFR3.3**: Corrupted files are ignored during upload
- **NFR3.4**: System continues operating if individual file operations fail

#### NFR4: Compatibility
- **NFR4.1**: Accept all file formats (no type restrictions)
- **NFR4.2**: Preserve exact file structure from client upload
- **NFR4.3**: Handle file paths with spaces, special characters
- **NFR4.4**: Cross-platform path handling (Windows/Mac/Linux)

#### NFR5: Maintainability
- **NFR5.1**: Follow existing Go backend patterns (handler/usecase/repository)
- **NFR5.2**: Reuse existing upload helper functions
- **NFR5.3**: Consistent error response format
- **NFR5.4**: Logging for all file operations (upload, download, delete)

---

## Success Criteria

### Quantitative Metrics
1. **Upload Success Rate**: >95% of file uploads complete successfully
2. **Version Retention**: 100% of file versions preserved (no data loss)
3. **Response Time**: File listing API responds in <500ms
4. **Storage Efficiency**: <5% overhead from versioning and metadata

### Qualitative Metrics
1. **User Satisfaction**: Operators report easier file management workflow
2. **Error Reduction**: Fewer configuration loss incidents
3. **System Integration**: Map editor seamlessly uploads without manual intervention
4. **Operational Efficiency**: Reduced time spent on file management tasks

### Key Performance Indicators (KPIs)
- **Daily Upload Volume**: Track number of files uploaded per day
- **Version History Usage**: Track how often users access old versions
- **Download Frequency**: Monitor file download patterns
- **Storage Growth**: Track storage usage over time per project

---

## Constraints & Assumptions

### Technical Constraints
- **C1**: Backend must use Go + Echo framework (existing stack)
- **C2**: File storage on local filesystem (no cloud storage integration)
- **C3**: Docker deployment with volume mounts for `shared/` directory
- **C4**: No external authentication system integration (internal use only)
- **C5**: Frontend React application handles chunking logic
- **C6**: Sequential upload processing (no parallel upload support)

### Business Constraints
- **C7**: No budget for external storage services
- **C8**: Development must reuse existing patterns (no new frameworks)
- **C9**: Must support existing projects (banpo, osong) without migration

### Assumptions
- **A1**: Project IDs are stable and won't change after creation
- **A2**: CCTV IDs follow pattern `{area}_{building}_{floor}_{position}` (e.g., `P1_B2_1_2`)
- **A3**: Map editor runs within the same system (not external tool)
- **A4**: Users have sufficient disk space for project files
- **A5**: Network bandwidth sufficient for large file uploads
- **A6**: No concurrent uploads for same project (frontend enforces)
- **A7**: File naming conflicts resolved by versioning (timestamp suffixes)

---

## Out of Scope

### Explicitly NOT Building
1. **File Sharing**: No sharing files between projects
2. **Access Control**: No role-based permissions (will be added later)
3. **File Synchronization**: No automatic sync with remote servers
4. **File Compression**: No automatic compression/decompression
5. **Image Processing**: No thumbnail generation or image optimization
6. **Search**: No full-text search within file contents
7. **Collaboration**: No multi-user simultaneous editing
8. **Backup**: No automatic backup to external storage
9. **Archive**: No automatic archiving of old versions
10. **Storage Quotas**: No per-project or per-user limits
11. **File Validation**: No format validation or schema checking
12. **Retry Logic**: No automatic retry for failed uploads
13. **Upload Resume**: No resume capability for interrupted uploads
14. **Conflict Resolution**: No merge tools for conflicting versions

---

## Dependencies

### Internal Dependencies
- **ID1**: Common upload utilities (`saveUploadedFile` helper function)
- **ID2**: Environment configuration (`common.Env.UploadPath`)
- **ID3**: Existing project entity and `project_id` scheme
- **ID4**: Docker volume mount configuration for `shared/` directory
- **ID5**: React frontend chunking implementation

### External Dependencies
- **ED1**: Go Echo framework v4
- **ED2**: Go standard library (`os`, `path/filepath`, `mime/multipart`)
- **ED3**: Filesystem with sufficient IOPS for concurrent access
- **ED4**: Docker for deployment environment

### Team Dependencies
- **TD1**: Frontend team: Implement chunking and progress UI
- **TD2**: Backend team: Implement file storage endpoints
- **TD3**: Map editor team: Integrate auto-upload on export
- **TD4**: DevOps: Configure volume mounts and monitor disk usage

---

## Technical Approach

### Backend Architecture

#### Directory Structure
```
backend/src/features/
├── filestorage/
│   ├── handler/
│   │   ├── index.go              # Route registration
│   │   ├── mapUploadHandler.go   # Map JSON upload/list/download
│   │   ├── cadUploadHandler.go   # CAD file upload/list/download
│   │   ├── roiUploadHandler.go   # ROI JSON upload/list/download
│   │   ├── learningUploadHandler.go  # Learning images upload/list/download
│   │   └── testUploadHandler.go  # Test images upload/list/download
│   ├── usecase/
│   │   ├── mapUploadUseCase.go
│   │   ├── cadUploadUseCase.go
│   │   ├── roiUploadUseCase.go
│   │   ├── learningUploadUseCase.go
│   │   └── testUploadUseCase.go
│   ├── repository/
│   │   └── fileStorageRepository.go  # File system operations
│   ├── model/
│   │   ├── request/
│   │   │   └── upload.go
│   │   ├── response/
│   │   │   ├── upload.go
│   │   │   ├── fileList.go
│   │   │   └── fileMetadata.go
│   │   └── entity/
│   │       └── fileVersion.go
│   └── middleware/
│       └── uploadValidator.go
```

#### API Endpoints

**Map JSON**
- `POST /api/filestorage/{project_id}/map/upload` - Upload map JSON (with auto-versioning)
- `GET /api/filestorage/{project_id}/map/list` - List all map JSON versions
- `GET /api/filestorage/{project_id}/map/download/{version}` - Download specific version
- `GET /api/filestorage/{project_id}/map/latest` - Download latest version

**CAD Files**
- `POST /api/filestorage/{project_id}/cad/upload` - Upload CAD file (with versioning)
- `GET /api/filestorage/{project_id}/cad/list` - List all CAD file versions
- `GET /api/filestorage/{project_id}/cad/download/{version}` - Download specific version

**ROI JSON**
- `POST /api/filestorage/{project_id}/roi/upload` - Upload ROI JSON (with versioning)
- `GET /api/filestorage/{project_id}/roi/list` - List all ROI JSON versions
- `GET /api/filestorage/{project_id}/roi/download/{version}` - Download specific version

**Learning Images**
- `POST /api/filestorage/{project_id}/learning/upload` - Upload learning images (preserves CCTV ID folders)
- `GET /api/filestorage/{project_id}/learning/list` - List all learning images (grouped by CCTV ID)
- `GET /api/filestorage/{project_id}/learning/download/{cctv_id}/{filename}` - Download specific image
- `GET /api/filestorage/{project_id}/learning/list/{cctv_id}` - List images for specific CCTV ID

**Test Images**
- `POST /api/filestorage/{project_id}/test/upload` - Upload test images (preserves CCTV ID folders)
- `GET /api/filestorage/{project_id}/test/list` - List all test images (grouped by CCTV ID)
- `GET /api/filestorage/{project_id}/test/download/{cctv_id}/{filename}` - Download specific image
- `GET /api/filestorage/{project_id}/test/list/{cctv_id}` - List images for specific CCTV ID

#### Versioning Strategy

**Filename Format**: `{original_name}_{unix_timestamp}.{extension}`

**Examples**:
- `parking_map.json` → `parking_map_1698765432.json`
- `site_layout.dwg` → `site_layout_1698765432.dwg`
- `roi_config.json` → `roi_config_1698765432.json`

**Version Metadata**:
```json
{
  "filename": "parking_map_1698765432.json",
  "original_name": "parking_map.json",
  "version": "1698765432",
  "size_bytes": 45678,
  "upload_date": "2025-10-27T06:57:59Z",
  "file_type": "application/json",
  "path": "shared/banpo/map/parking_map_1698765432.json"
}
```

#### Upload Flow

1. **Request Validation**: Check project_id exists, validate multipart form
2. **Directory Preparation**: Create `shared/{project_id}/{category}/` if not exists
3. **Version Generation**: Append timestamp to filename for JSON/CAD files
4. **File Saving**: Use existing `saveUploadedFile` helper
5. **Folder Structure**: Preserve original paths for image folders (CCTV IDs)
6. **Response**: Return success count, failed count, version info

#### Error Handling Philosophy
- **Silent Failures**: Individual file failures don't stop batch uploads
- **Partial Success**: Return counts of successful/failed uploads
- **No Rollback**: Completed uploads remain even if later files fail
- **Logging Only**: Log errors but don't expose to API response

### Frontend Implementation

#### File Upload UI Components

**Location**: `frontend/src/components/FileStorage/`

**Components**:
- `FileStoragePage.tsx` - Main page with tabs for each file type
- `MapUploader.tsx` - Map JSON upload with version list
- `CadUploader.tsx` - CAD file upload/download
- `RoiUploader.tsx` - ROI JSON upload with version list
- `LearningImageUploader.tsx` - Folder upload with progress bar
- `TestImageUploader.tsx` - Folder upload with progress bar
- `FileBrowser.tsx` - Tree view of uploaded files
- `VersionList.tsx` - Display version history with download buttons
- `UploadProgress.tsx` - Progress indicator for chunked uploads

#### Chunking Strategy

**Chunk Size**: 10MB per chunk
**Implementation**: Frontend splits files >100MB into chunks
**Upload Pattern**:
1. Split file into 10MB chunks
2. Upload chunks sequentially (not parallel)
3. Backend reassembles chunks
4. Update progress bar after each chunk

**Chunk Request Format**:
```typescript
{
  chunk: Blob,           // 10MB chunk
  chunk_index: number,   // 0-based index
  total_chunks: number,  // Total number of chunks
  filename: string,      // Original filename
  project_id: string     // Project identifier
}
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- Create `filestorage` feature module structure
- Implement base repository for file system operations
- Setup versioning utility functions
- Create common upload/download handlers

### Phase 2: Map & ROI JSON (Week 1-2)
- Implement map JSON upload with versioning
- Implement ROI JSON upload with versioning
- Create version listing endpoints
- Build frontend upload/version list UI
- Integrate map editor auto-upload

### Phase 3: CAD Files (Week 2)
- Implement CAD file upload with versioning
- Create download endpoint
- Build frontend CAD uploader UI
- Test with various CAD formats

### Phase 4: Image Folders (Week 2-3)
- Implement learning image upload with CCTV ID preservation
- Implement test image upload with CCTV ID preservation
- Create CCTV ID filtering endpoints
- Build frontend folder upload with progress tracking

### Phase 5: File Browser (Week 3)
- Implement file listing with metadata
- Create file tree structure endpoint
- Build frontend file browser component
- Add search/filter functionality

### Phase 6: Testing & Polish (Week 4)
- Integration testing with large file uploads
- Performance testing with 1000+ files
- Error scenario testing (disk full, permissions)
- Documentation and deployment guide

---

## Risks & Mitigations

### Risk 1: Disk Space Exhaustion
**Impact**: High
**Probability**: Medium
**Mitigation**:
- Monitor disk usage with alerts at 80% capacity
- Document storage growth expectations
- Plan for storage expansion if needed

### Risk 2: Upload Timeout on Large Files
**Impact**: Medium
**Probability**: Medium
**Mitigation**:
- Frontend chunking keeps requests small
- Increase server timeout for upload endpoints
- Add retry logic in frontend (out of scope → manual retry)

### Risk 3: Version History Bloat
**Impact**: Low
**Probability**: High
**Mitigation**:
- Accept storage overhead as intentional design
- Future feature: manual version cleanup tool
- Document recommended cleanup practices

### Risk 4: Concurrent Upload Conflicts
**Impact**: Low
**Probability**: Low
**Mitigation**:
- Frontend enforces sequential uploads
- Last write wins (no conflict detection)
- Document sequential upload requirement

### Risk 5: CCTV ID Naming Changes
**Impact**: Medium
**Probability**: Low
**Mitigation**:
- Accept current naming pattern as standard
- Document CCTV ID format requirements
- Future feature: folder renaming tool if needed

---

## Open Questions

1. **Q1**: Should we implement automatic cleanup of versions older than X days?
   **Decision**: No, unlimited retention for now. Can add later if storage becomes issue.

2. **Q2**: Do we need file checksums to verify upload integrity?
   **Decision**: No, relies on HTTP integrity and filesystem reliability.

3. **Q3**: Should map editor auto-upload be synchronous or fire-and-forget?
   **Decision**: Fire-and-forget (async) to avoid blocking editor export.

4. **Q4**: What happens if user uploads files with same CCTV ID but different naming conventions?
   **Decision**: Accept both, no validation of CCTV ID format.

5. **Q5**: Should we support bulk download (zip multiple files)?
   **Decision**: Not in scope. Users download individually or use OS tools.

---

## Appendix

### File Path Examples

**Project: banpo**
```
shared/banpo/
├── map/
│   ├── parking_map_1698765432.json
│   ├── parking_map_1698765890.json
│   └── parking_map_1698766123.json
├── cad/
│   ├── site_layout_1698765432.dwg
│   └── site_layout_1698765890.dwg
├── learning/
│   ├── P1_B2_1_2/
│   │   ├── image001.jpg
│   │   └── image002.jpg
│   └── P1_B2_1_3/
│       └── image001.jpg
├── roi/
│   ├── roi_config_1698765432.json
│   └── roi_config_1698765890.json
└── test/
    ├── P1_B2_1_2/
    │   └── test_001.jpg
    └── P1_B2_1_3/
        └── test_001.jpg
```

### API Response Examples

**Upload Success Response**:
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": {
    "total_files": 150,
    "success_count": 148,
    "failed_count": 2,
    "version": "1698765432",
    "uploaded_files": [
      {
        "filename": "parking_map_1698765432.json",
        "path": "shared/banpo/map/parking_map_1698765432.json",
        "size_bytes": 45678
      }
    ]
  }
}
```

**File List Response**:
```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "data": {
    "total_count": 3,
    "files": [
      {
        "filename": "parking_map_1698766123.json",
        "original_name": "parking_map.json",
        "version": "1698766123",
        "size_bytes": 45678,
        "upload_date": "2025-10-27T08:15:23Z",
        "file_type": "application/json"
      },
      {
        "filename": "parking_map_1698765890.json",
        "original_name": "parking_map.json",
        "version": "1698765890",
        "size_bytes": 45670,
        "upload_date": "2025-10-27T07:58:10Z",
        "file_type": "application/json"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 100,
      "total_pages": 1
    }
  }
}
```

### Reference Implementation Patterns

Based on existing codebase:
- Follow `testUploadParkingUseCase.go` pattern for folder uploads
- Use `learningUploadParkingUseCase.go` timestamp-based folder naming
- Implement similar error collection without failing entire batch
- Preserve `Content-Disposition` header parsing for folder structure

---

## Glossary

- **CCTV ID**: Camera identifier following pattern `{area}_{building}_{floor}_{position}` (e.g., `P1_B2_1_2`)
- **Map JSON**: Configuration file defining parking space layout and metadata
- **ROI JSON**: Region of Interest configuration for parking detection algorithm
- **CAD File**: Computer-Aided Design file containing architectural drawings (e.g., `.dwg`, `.dxf`)
- **Learning Images**: Training dataset images used to train parking detection algorithm
- **Test Images**: Validation dataset images used to test algorithm performance
- **Version**: Unique timestamp-based identifier for file revisions
- **Chunking**: Process of splitting large files into smaller pieces for upload
- **Project ID**: Unique identifier for parking management project (e.g., `banpo`, `osong`)

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-27 | 1.0 | Initial PRD creation | Product Team |
