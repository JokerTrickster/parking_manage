---
name: project-file-storage
status: backlog
created: 2025-10-27T07:01:30Z
progress: 0%
prd: .claude/prds/project-file-storage.md
github: [Will be updated when synced to GitHub]
---

# Epic: Project File Storage System

## Overview

Implement a unified file storage system for parking management projects that handles 5 file types (map JSON, CAD, ROI JSON, learning images, test images) with automatic versioning for configuration files and organized CCTV-based image storage. The system leverages existing upload infrastructure and patterns while adding version management and a comprehensive file browser UI.

**Key Simplification**: Rather than creating separate handlers for each file type, we'll create a generic versioned file handler that can be configured for different file categories, significantly reducing code duplication.

## Architecture Decisions

### AD1: Leverage Existing Upload Infrastructure
**Decision**: Reuse existing `testUploadParkingUseCase` and `learningUploadParkingUseCase` patterns instead of creating new ones from scratch.

**Rationale**:
- Both usecases already handle multipart uploads with folder structure preservation
- Content-Disposition header parsing already implemented
- Error handling pattern (partial success) already proven
- Reduces development time by ~40%

**Impact**: Only need to add versioning logic on top of existing upload flow.

### AD2: Generic Versioned File Handler
**Decision**: Create a single generic handler that supports both versioned files (map, CAD, ROI) and non-versioned folders (learning, test images) through configuration.

**Rationale**:
- Eliminates duplicate code across 5 separate handlers
- Centralized versioning logic easier to maintain
- Consistent API patterns across all file types
- Reduces total handler count from 15 to 3 (upload, list, download)

**Implementation**:
```go
// Single handler configured for different categories
type FileStorageHandler struct {
    UseCase IFileStorageUseCase
}

// Routes configured per category
c.POST("/api/filestorage/:projectId/map/upload", handler.Upload("map", true))    // versioned
c.POST("/api/filestorage/:projectId/cad/upload", handler.Upload("cad", true))    // versioned
c.POST("/api/filestorage/:projectId/roi/upload", handler.Upload("roi", true))    // versioned
c.POST("/api/filestorage/:projectId/learning/upload", handler.Upload("learning", false)) // not versioned
c.POST("/api/filestorage/:projectId/test/upload", handler.Upload("test", false))        // not versioned
```

### AD3: Filesystem-Based Versioning (No Database)
**Decision**: Store version metadata directly in filename using timestamp suffix, no database table for versions.

**Rationale**:
- Eliminates database dependency and migration
- Version info self-contained in filesystem
- Simpler deployment (no schema changes)
- Easier debugging (can inspect files directly)
- Matches existing timestamp-based folder naming pattern

**Implementation**: `parking_map.json` → `parking_map_1698765432.json`

### AD4: Frontend Chunking with Backend Reassembly
**Decision**: Frontend handles large file chunking (10MB chunks), backend reassembles on disk.

**Rationale**:
- Prevents request timeout on large files
- Frontend already handles progress tracking
- Backend remains stateless (no session management)
- Sequential chunk processing prevents conflicts

**Trade-off**: Slightly more complex frontend logic, but backend stays simple.

### AD5: Map Editor Auto-Upload Integration Point
**Decision**: Expose dedicated endpoint that map editor can call programmatically, separate from manual upload UI.

**Rationale**:
- Decouples map editor integration from user-facing upload
- Allows different error handling (silent vs user-visible)
- Can add editor-specific validation if needed later
- Clear audit trail of auto vs manual uploads

**Endpoint**: `POST /api/filestorage/:projectId/map/auto-upload` (fire-and-forget, async)

## Technical Approach

### Backend Architecture

#### Simplified Module Structure
```
backend/src/features/filestorage/
├── handler/
│   ├── index.go                    # Route registration for all file types
│   ├── fileStorageHandler.go      # Generic upload/list/download handler
│   └── autoUploadHandler.go       # Map editor auto-upload endpoint
├── usecase/
│   ├── fileStorageUseCase.go      # Generic file operations with versioning
│   └── autoUploadUseCase.go       # Async auto-upload logic
├── repository/
│   └── fileStorageRepository.go   # Filesystem operations (save, list, read, delete)
├── model/
│   ├── request/
│   │   ├── upload.go              # Upload request model
│   │   └── fileQuery.go           # List/filter request model
│   ├── response/
│   │   ├── upload.go              # Upload response with version info
│   │   ├── fileList.go            # File listing with metadata
│   │   └── fileMetadata.go        # Individual file metadata
│   └── entity/
│       ├── fileCategory.go        # Enum: map, cad, roi, learning, test
│       └── fileInfo.go            # File information struct
└── util/
    └── versioning.go               # Version generation and parsing utilities
```

**Total Files**: ~15 files (vs 25+ in original PRD design)

#### Core API Endpoints (Consolidated)

**Upload** (Single handler, 5 routes):
- `POST /api/filestorage/:projectId/map/upload`
- `POST /api/filestorage/:projectId/cad/upload`
- `POST /api/filestorage/:projectId/roi/upload`
- `POST /api/filestorage/:projectId/learning/upload`
- `POST /api/filestorage/:projectId/test/upload`
- `POST /api/filestorage/:projectId/map/auto-upload` (map editor integration)

**List** (Single handler, 5 routes):
- `GET /api/filestorage/:projectId/map/list`
- `GET /api/filestorage/:projectId/cad/list`
- `GET /api/filestorage/:projectId/roi/list`
- `GET /api/filestorage/:projectId/learning/list?cctv_id={id}`
- `GET /api/filestorage/:projectId/test/list?cctv_id={id}`

**Download** (Single handler, dynamic routing):
- `GET /api/filestorage/:projectId/:category/download/:filename`
- `GET /api/filestorage/:projectId/:category/latest` (for versioned files)

### Frontend Architecture

#### Component Organization
```
frontend/src/components/FileStorage/
├── FileStoragePage.tsx            # Main page with category tabs
├── VersionedFileUploader.tsx      # Generic uploader for map/cad/roi (with version list)
├── ImageFolderUploader.tsx        # Generic uploader for learning/test (with progress)
├── FileBrowser.tsx                # Tree view of all files by category
├── UploadProgress.tsx             # Progress bar component
└── hooks/
    ├── useFileUpload.ts           # Upload logic with chunking
    ├── useFileList.ts             # Fetch file list
    └── useFileDownload.ts         # Download helper
```

**Total Components**: 6 core components (vs 9 in original PRD design)

#### Reusable Upload Logic

**Generic Uploader Props**:
```typescript
interface FileUploaderProps {
  projectId: string;
  category: 'map' | 'cad' | 'roi' | 'learning' | 'test';
  isVersioned: boolean;
  allowMultiple: boolean;
  acceptedFormats?: string[];
}
```

**Benefits**:
- Single component handles map/CAD/ROI uploads (just different category prop)
- Single component handles learning/test uploads (just different category prop)
- DRY principle applied throughout

### Infrastructure

#### Directory Structure (Filesystem)
```
shared/
├── {project_id}/
│   ├── map/
│   │   ├── parking_map_1698765432.json
│   │   └── parking_map_1698766123.json
│   ├── cad/
│   │   └── site_layout_1698765432.dwg
│   ├── roi/
│   │   ├── roi_config_1698765432.json
│   │   └── roi_config_1698765890.json
│   ├── learning/
│   │   ├── P1_B2_1_2/
│   │   │   ├── image001.jpg
│   │   │   └── image002.jpg
│   │   └── P1_B2_1_3/
│   │       └── image001.jpg
│   └── test/
│       ├── P1_B2_1_2/
│       │   └── test_001.jpg
│       └── P1_B2_1_3/
│           └── test_001.jpg
```

**Volume Mount**: Docker volume already configured for `shared/` directory.

## Implementation Strategy

### Phase 1: Core Backend Infrastructure
**Duration**: 2 days

1. Create `filestorage` feature module structure
2. Implement versioning utility functions (generate timestamp suffix, parse version from filename)
3. Create generic file storage repository (save, list, read, delete operations)
4. Implement generic file storage usecase with versioning logic
5. Create generic handler with category-based routing

**Key Pattern**: Follow existing `testUploadParkingUseCase.go` for folder handling, add versioning on top.

### Phase 2: API Endpoints & Map Editor Integration
**Duration**: 2 days

1. Register all upload/list/download routes in `index.go`
2. Implement auto-upload endpoint for map editor
3. Add file listing with metadata extraction from filesystem
4. Implement download with streaming support
5. Test all endpoints with Postman/curl

**Deliverable**: Fully functional backend API ready for frontend integration.

### Phase 3: Frontend Components
**Duration**: 3 days

1. Create generic `VersionedFileUploader` component (for map/cad/roi)
2. Create generic `ImageFolderUploader` component (for learning/test)
3. Implement chunking logic in `useFileUpload` hook
4. Build `FileBrowser` component with category tabs
5. Create `FileStoragePage` that ties everything together

**Key Reuse**: Leverage existing Material-UI patterns from current frontend.

### Phase 4: Testing & Polish
**Duration**: 2 days

1. Integration testing: Upload → List → Download flow for all categories
2. Performance testing: 1000+ image upload with progress tracking
3. Version history testing: Multiple uploads, download specific versions
4. Map editor integration testing: Auto-upload flow
5. Error scenario testing: Large files, corrupted uploads, disk space

**Acceptance**: All user stories from PRD validated.

### Phase 5: Documentation & Deployment
**Duration**: 1 day

1. Update API documentation (Swagger annotations)
2. Create user guide for file management UI
3. Document map editor integration steps
4. Update Docker configuration if needed
5. Deploy to staging for QA validation

**Total Duration**: 10 days (2 weeks)

## Task Breakdown Preview

Based on the simplified architecture, here are the consolidated task categories:

- [ ] **Backend Core Infrastructure** (2 days)
  - Create filestorage module structure (handler/usecase/repository/model)
  - Implement versioning utilities (timestamp generation, filename parsing)
  - Create generic file storage repository (CRUD operations)
  - Implement generic file storage usecase with versioning support
  - Create generic handler with category-based routing

- [ ] **API Endpoints Implementation** (2 days)
  - Register all upload/list/download routes for 5 file categories
  - Implement map editor auto-upload endpoint (async, fire-and-forget)
  - Add file listing with filesystem metadata extraction
  - Implement streaming file download with MIME type detection
  - Add CCTV ID filtering for learning/test image lists

- [ ] **Frontend Components** (3 days)
  - Create VersionedFileUploader component (map/cad/roi with version list)
  - Create ImageFolderUploader component (learning/test with progress bar)
  - Implement useFileUpload hook with chunking logic (10MB chunks)
  - Build FileBrowser component with category tabs and tree view
  - Create FileStoragePage main component with navigation

- [ ] **Map Editor Integration** (1 day)
  - Expose auto-upload API endpoint
  - Implement async upload handler (non-blocking)
  - Test integration with map editor export functionality
  - Document integration process for map editor team

- [ ] **Testing & Quality Assurance** (2 days)
  - Integration testing: Complete upload/list/download flows for all categories
  - Performance testing: 1000+ image uploads, file listing with 10K files
  - Version history testing: Multiple uploads, specific version downloads
  - Error scenario testing: Large files, corrupted data, disk space limits
  - Cross-browser testing for frontend components

- [ ] **Documentation & Deployment** (1 day)
  - Update Swagger API documentation with new endpoints
  - Create user guide for file management features
  - Document map editor auto-upload integration
  - Update Docker configuration and volume mounts
  - Deploy to staging and conduct QA validation

**Total Tasks**: 6 task categories covering all requirements

## Dependencies

### Internal Dependencies
- ✅ **Existing Upload Utilities**: `saveUploadedFile` helper in `testUploadParkingUseCase.go`
- ✅ **Environment Config**: `common.Env.UploadPath` already configured
- ✅ **Project Entity**: `project_id` scheme already in use (banpo, osong)
- ✅ **Docker Volume**: `shared/` directory already mounted in container
- 🔲 **Map Editor**: Need to coordinate auto-upload integration

### External Dependencies
- ✅ **Go Echo Framework v4**: Already in use, no upgrade needed
- ✅ **Go Standard Library**: `os`, `path/filepath`, `mime/multipart` available
- ✅ **React + TypeScript**: Frontend stack already configured
- ✅ **Material-UI**: Component library already in use

### Team Dependencies
- **Backend Team** (You): Implement all backend endpoints and logic
- **Frontend Team** (You): Implement React components and chunking
- **Map Editor Team**: Integrate auto-upload API call on export
- **DevOps Team**: Monitor disk usage, configure alerts at 80% capacity

## Success Criteria (Technical)

### Performance Benchmarks
- ✅ File upload throughput: ≥50MB/s on local network
- ✅ File listing response: <500ms for up to 10,000 files
- ✅ Download streaming starts: <100ms
- ✅ Bulk upload (1000 images): <5 minutes with progress tracking

### Quality Gates
- ✅ Upload success rate: >95% (partial success acceptable)
- ✅ Version retention: 100% (no data loss, all versions preserved)
- ✅ Code coverage: >80% for usecase layer (unit tests)
- ✅ Zero duplicate code between file type handlers (DRY compliance)

### Acceptance Criteria
- ✅ All 5 file types (map, cad, roi, learning, test) upload successfully
- ✅ Versioning works correctly for map/cad/roi files
- ✅ CCTV ID folder structure preserved for learning/test images
- ✅ File browser displays all files with correct metadata
- ✅ Download works for individual files and specific versions
- ✅ Map editor auto-upload integrates without blocking export
- ✅ Large file uploads complete with progress indicator
- ✅ Error scenarios handled gracefully (partial success, no crashes)

### Monitoring & Observability
- Log all file operations (upload, download, delete) with project_id
- Track upload success/failure rates per category
- Monitor disk space usage per project
- Alert when storage reaches 80% capacity
- Track file version history growth over time

## Estimated Effort

### Overall Timeline
- **Backend Development**: 4 days
- **Frontend Development**: 3 days
- **Integration & Testing**: 2 days
- **Documentation & Deployment**: 1 day
- **Total**: 10 days (2 weeks)

### Resource Requirements
- **Backend Engineer**: 1 developer, full-time (10 days)
- **Frontend Engineer**: 1 developer, full-time (3 days, overlapping)
- **QA Engineer**: 1 developer, part-time (2 days testing)
- **DevOps**: 0.5 days (configuration and monitoring setup)

### Critical Path Items
1. **Backend API Completion** (blocks frontend development)
2. **Versioning Logic** (critical for data integrity)
3. **Chunking Implementation** (needed for large file support)
4. **Map Editor Integration** (external dependency, may slip)

### Risk Buffer
- Added 20% buffer to estimates (actual work ~8 days, estimated 10 days)
- Map editor integration is out of critical path (can be added post-launch)
- Frontend chunking can be simplified if performance is acceptable without it

## Simplification Wins

### Code Reduction
- **Original Design**: 25+ files across 5 separate handlers
- **Simplified Design**: 15 files with generic handlers
- **Reduction**: ~40% less code to write and maintain

### Reuse Maximization
- ✅ Leverage existing upload usecases (testUploadParkingUseCase pattern)
- ✅ Reuse Content-Disposition header parsing logic
- ✅ Reuse error handling patterns (partial success)
- ✅ Reuse frontend Material-UI components and patterns

### Development Efficiency
- **Original Estimate**: 4 weeks (20 days)
- **Optimized Estimate**: 2 weeks (10 days)
- **Time Saved**: 50% reduction through code reuse and generic design

## Open Questions & Decisions

### Q1: Should we add version cleanup functionality?
**Decision**: Not in initial scope. Can add admin tool later if storage becomes issue.

### Q2: Do we need file integrity checks (checksums)?
**Decision**: No. Rely on HTTP integrity and filesystem reliability. Can add later if corruption issues arise.

### Q3: How to handle map editor auto-upload failures?
**Decision**: Fire-and-forget (async). Log errors but don't block editor export. User can manually upload if auto-upload fails.

### Q4: Should we support bulk download (zip multiple files)?
**Decision**: Not in scope. Users can download individually or use OS tools to zip locally.

### Q5: What happens if disk space runs out during upload?
**Decision**: Partial success pattern - save what fits, return counts. Monitor disk usage proactively to prevent this.

## Tasks Created

- [ ] 001.md - Backend Core Infrastructure Setup (parallel: false, 16 hours)
- [ ] 002.md - API Endpoints Implementation (parallel: false, 16 hours)
- [ ] 003.md - Frontend Components Development (parallel: false, 24 hours)
- [ ] 004.md - Map Editor Auto-Upload Integration (parallel: true, 8 hours)
- [ ] 005.md - Testing & Quality Assurance (parallel: false, 16 hours)
- [ ] 006.md - Documentation & Deployment (parallel: false, 8 hours)

**Total Tasks**: 6
**Parallel Tasks**: 1 (Task 004 can run alongside Task 003)
**Sequential Tasks**: 5
**Estimated Total Effort**: 88 hours (11 days)

### Dependency Graph
```
001 (Backend Core) [16h]
  ↓
002 (API Endpoints) [16h]
  ↓
003 (Frontend) [24h] ← can run parallel with → 004 (Map Editor) [8h]
  ↓                                              ↓
005 (Testing & QA) [16h] ←←←←←←←←←←←←←←←←←←←←←←←←←
  ↓
006 (Documentation & Deployment) [8h]
```

### Critical Path
001 → 002 → 003 → 005 → 006 = 80 hours (10 days)

Task 004 can run in parallel with Task 003, saving time in the schedule.

## Next Steps

After epic approval:
1. ✅ **Task Decomposition**: Completed - 6 tasks created
2. **Sprint Planning**: Assign tasks to sprint backlog
3. **Kickoff**: Schedule technical design review with team
4. **Development**: Begin Task 001 (Backend Core Infrastructure)

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-27 | 1.0 | Initial epic creation with simplified architecture | Technical Lead |
