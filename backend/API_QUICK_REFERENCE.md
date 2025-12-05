# Learning Data Management API - Quick Reference

## Base URL
```
http://localhost:5000/v0.1/filestorage/{projectId}
```

---

## API Endpoints

### 1️⃣ Get ROI Files
```http
GET /roi/folders
```
**Returns**: List of ROI JSON files in flat structure

---

### 2️⃣ Get ROI Data (Parsed JSON)
```http
GET /roi/latest?original_name=P1_B2_3.json
```
**Returns**: Parsed JSON content (cctv_id, rois, dimensions)

---

### 3️⃣ Get Learning Folders (with subfolders)
```http
GET /learning/folders
```
**Returns**: Nested structure (timestamp folders → CCTV folders → images)

---

### 4️⃣ Download Image (nested path)
```http
GET /learning/download/2025-01-01_10-30-00/P1_B2_3/image_001.jpg
```
**Returns**: Binary image data

---

### 5️⃣ Upload Edited Image
```http
POST /learning/upload?folder_path=2025-01-01_10-30-00/P1_B2_3
Content-Type: multipart/form-data

files: <image file>
```
**Returns**: Upload confirmation with file metadata

---

## Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Testing

```bash
# Run test script
chmod +x backend/test_learning_data_api.sh
./backend/test_learning_data_api.sh

# Or test individual endpoints
curl http://localhost:5000/v0.1/filestorage/test_project/roi/folders | jq
curl http://localhost:5000/v0.1/filestorage/test_project/roi/latest?original_name=P1_B2_3.json | jq
curl http://localhost:5000/v0.1/filestorage/test_project/learning/folders | jq
```

---

## File Storage Structure

```
/shared/{projectId}/
├── roi/
│   ├── P1_B2_3.json              # ROI files (flat)
│   └── P1_B2_4.json
└── learningImages/
    └── {timestamp}/               # Learning folders (2-level)
        ├── {cctvId}/
        │   └── *.jpg
        └── {cctvId}/
            └── *.jpg
```
