# Map Editor Auto-Upload Integration Guide

## Overview

The auto-upload feature enables the map editor to automatically save map JSON files to the backend storage system without blocking the user interface. This is a fire-and-forget implementation that returns immediately while processing the upload asynchronously in the background.

## API Endpoint

### Auto-Upload Map JSON

```
POST /v0.1/filestorage/:projectId/map/auto-upload
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectId | string | Yes | Project identifier (e.g., "banpo", "osong", "test_project") |

#### Request Body

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Map JSON file to upload |

#### Response

**Status Code:** `202 Accepted` (returned immediately)

**Response Body:**
```json
{
  "success": true,
  "message": "upload initiated",
  "data": {
    "project_id": "test_project",
    "filename": "parking_map.json"
  }
}
```

#### Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "projectId is required"
}
```

```json
{
  "success": false,
  "message": "failed to parse form data"
}
```

```json
{
  "success": false,
  "message": "no file provided"
}
```

## Implementation Details

### Fire-and-Forget Pattern

The endpoint uses a goroutine-based async pattern:
1. Client sends POST request with file
2. Server validates request and returns `202 Accepted` immediately
3. File upload proceeds in background goroutine
4. Upload errors are logged but not returned to client
5. Client can continue operations without waiting

### Versioning

All uploaded files are automatically versioned with Unix timestamps:
- Original: `parking_map.json`
- Versioned: `parking_map_1761550689.json`

This ensures:
- Previous versions are never overwritten
- Complete upload history is maintained
- Version conflicts are impossible

### File Storage

Files are stored in the following directory structure:
```
shared/
└── {projectId}/
    └── map/
        ├── parking_map_1761550689.json
        ├── parking_map_1761550715.json
        └── parking_map_1761550820.json
```

### Logging

All upload operations are logged:

**Success:**
```
[AUTO-UPLOAD] SUCCESS: project=test_project, file=parking_map.json -> parking_map_1761550689.json
```

**Error:**
```
[AUTO-UPLOAD] ERROR: project=test_project, file=parking_map.json, error=failed to save file: disk full
```

**Warning (non-JSON files):**
```
[AUTO-UPLOAD] WARNING: Non-JSON file uploaded: image.png
```

## Integration Examples

### JavaScript/Fetch API

```javascript
async function autoUploadMap(projectId, file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(
      `http://localhost:5000/v0.1/filestorage/${projectId}/map/auto-upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (response.status === 202) {
      const result = await response.json();
      console.log('Upload initiated:', result.data.filename);
      // Continue with other operations - upload happens in background
      return result;
    } else {
      const error = await response.json();
      console.error('Upload failed:', error.message);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}

// Usage in map editor
const mapData = { version: "1.0", nodes: [...], edges: [...] };
const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
const file = new File([blob], 'parking_map.json', { type: 'application/json' });

autoUploadMap('banpo', file)
  .then(result => {
    console.log('Auto-upload started');
    // Continue editing - no need to wait
  })
  .catch(error => {
    console.error('Failed to initiate upload:', error);
  });
```

### cURL

```bash
# Basic upload
curl -X POST "http://localhost:5000/v0.1/filestorage/test_project/map/auto-upload" \
  -F "file=@parking_map.json" \
  -w "\nHTTP Status: %{http_code}\n"

# With verbose output
curl -v -X POST "http://localhost:5000/v0.1/filestorage/banpo/map/auto-upload" \
  -F "file=@parking_map.json"
```

### Python/Requests

```python
import requests

def auto_upload_map(project_id, file_path):
    url = f"http://localhost:5000/v0.1/filestorage/{project_id}/map/auto-upload"

    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, files=files)

    if response.status_code == 202:
        result = response.json()
        print(f"Upload initiated: {result['data']['filename']}")
        return result
    else:
        error = response.json()
        raise Exception(f"Upload failed: {error['message']}")

# Usage
auto_upload_map('test_project', 'parking_map.json')
```

## Best Practices

### 1. Client-Side Implementation

- **Don't wait for completion:** The endpoint returns immediately - continue operations
- **Handle only client errors:** Only 400-level errors need user notification
- **No retry logic needed:** Server logs all errors for debugging
- **Validate before upload:** Check file type/size on client to avoid unnecessary requests

### 2. File Validation

The endpoint logs warnings for non-JSON files but doesn't reject them. For production:
- Client should validate file extension before upload
- Recommended max file size: 10 MB
- Supported format: JSON

### 3. Error Handling

Since upload happens asynchronously:
- Monitor server logs for upload errors
- Implement periodic status checks if needed
- Consider adding webhook notifications for failures

### 4. Monitoring

Track these metrics for production:
- Upload success rate (from logs)
- Average upload time (from logs)
- Disk space usage in `shared/{project}/map/`
- Failed upload frequency and reasons

## Troubleshooting

### Issue: 404 Not Found

**Cause:** Route not registered or server not restarted after deployment

**Solution:**
```bash
# Restart server
cd backend/src
go run main.go
```

### Issue: Upload appears successful but file not found

**Cause:** Check upload path configuration

**Solution:**
```bash
# Verify UPLOAD_PATH env variable
echo $UPLOAD_PATH

# Check actual file location
ls -la shared/{projectId}/map/
```

### Issue: Goroutine leaks or memory issues

**Cause:** Large files or high upload frequency

**Solution:**
- Implement upload concurrency limits
- Add context timeouts (currently 120s)
- Monitor goroutine count

## Security Considerations

### Current Implementation

- No authentication required (per PRD requirements)
- No file type validation (logs warnings only)
- No rate limiting
- No file size limits beyond server config

### Production Recommendations

1. **Add authentication:** Require JWT token for uploads
2. **Implement rate limiting:** Prevent abuse (e.g., 10 uploads/minute)
3. **Validate file content:** Verify JSON structure before saving
4. **Add virus scanning:** For uploaded files
5. **Implement cleanup:** Remove old versions after N days

## Performance Characteristics

- **Response Time:** < 10ms (validation only)
- **Background Upload:** Depends on file size and disk I/O
- **Concurrency:** Unlimited (each request spawns new goroutine)
- **Memory Usage:** One goroutine per upload (minimal overhead)

## Version History

- **v1.0.0** (2025-10-27): Initial implementation
  - Fire-and-forget async upload
  - Automatic timestamp-based versioning
  - Comprehensive logging
  - No validation per PRD requirements
