#!/bin/bash

# Test script for Learning Data Management API
# This tests all 5 required endpoints

PROJECT_ID="test_project"
BASE_URL="http://localhost:5000"

echo "======================================"
echo "Learning Data Management API Tests"
echo "======================================"
echo ""

# Test 1: Get ROI file list
echo "=== Test 1: GET /v0.1/filestorage/$PROJECT_ID/roi/folders ==="
curl -s -X GET "$BASE_URL/v0.1/filestorage/$PROJECT_ID/roi/folders" | jq '.' || echo "Failed"
echo ""

# Test 2: Get ROI file data (parsed JSON)
echo "=== Test 2: GET /v0.1/filestorage/$PROJECT_ID/roi/latest?original_name=P1_B2_3.json ==="
curl -s -X GET "$BASE_URL/v0.1/filestorage/$PROJECT_ID/roi/latest?original_name=P1_B2_3.json" | jq '.' || echo "Failed"
echo ""

# Test 3: Get learning folders with subfolders
echo "=== Test 3: GET /v0.1/filestorage/$PROJECT_ID/learning/folders ==="
curl -s -X GET "$BASE_URL/v0.1/filestorage/$PROJECT_ID/learning/folders" | jq '.' || echo "Failed"
echo ""

# Test 4: Download image with nested path
echo "=== Test 4: GET /v0.1/filestorage/$PROJECT_ID/learning/download/2025-01-01_10-30-00/P1_B2_3/image_001.jpg ==="
curl -s -X GET "$BASE_URL/v0.1/filestorage/$PROJECT_ID/learning/download/2025-01-01_10-30-00/P1_B2_3/image_001.jpg" -o /tmp/test_download.jpg && \
  echo "Downloaded successfully: $(file /tmp/test_download.jpg)" || echo "Failed"
echo ""

# Test 5: Upload edited image to specific folder
echo "=== Test 5: POST /v0.1/filestorage/$PROJECT_ID/learning/upload?folder_path=2025-01-01_10-30-00/P1_B2_3 ==="
echo "test edited content" > /tmp/test_edited.jpg
curl -s -X POST "$BASE_URL/v0.1/filestorage/$PROJECT_ID/learning/upload?folder_path=2025-01-01_10-30-00/P1_B2_3" \
  -F "files=@/tmp/test_edited.jpg" | jq '.' || echo "Failed"
echo ""

# Verify uploaded file exists
echo "=== Verify: Check if uploaded file exists in filesystem ==="
ls -lh /Users/luxrobo/project/parking_manage/shared/test_project/learningImages/2025-01-01_10-30-00/P1_B2_3/ | grep "test_edited"
echo ""

echo "======================================"
echo "All tests completed!"
echo "======================================"
