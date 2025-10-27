#!/bin/bash

# File Storage API Test Script
# Tests all file storage endpoints

BASE_URL="http://localhost:5000"
PROJECT_ID="test_project"

echo "=== File Storage API Integration Tests ==="
echo ""

# Test 1: Upload map JSON file
echo "Test 1: Upload map JSON file"
echo "-----------------------------------"
curl -X POST "${BASE_URL}/v0.1/filestorage/${PROJECT_ID}/map/upload" \
  -F "files=@/tmp/test_map.json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq .
echo ""

# Test 2: List map files
echo "Test 2: List map files"
echo "-----------------------------------"
curl -X GET "${BASE_URL}/v0.1/filestorage/${PROJECT_ID}/map/list" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq .
echo ""

# Test 3: Upload another version
echo "Test 3: Upload another version of map file"
echo "-----------------------------------"
sleep 2  # Wait to ensure different timestamp
curl -X POST "${BASE_URL}/v0.1/filestorage/${PROJECT_ID}/map/upload" \
  -F "files=@/tmp/test_map.json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq .
echo ""

# Test 4: List map files again (should show 2 versions)
echo "Test 4: List map files (should show 2 versions)"
echo "-----------------------------------"
curl -X GET "${BASE_URL}/v0.1/filestorage/${PROJECT_ID}/map/list" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq .
echo ""

# Test 5: Download latest version
echo "Test 5: Download latest version"
echo "-----------------------------------"
curl -X GET "${BASE_URL}/v0.1/filestorage/${PROJECT_ID}/map/latest?original_name=test_map.json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -o /tmp/downloaded_map.json
echo "Downloaded to /tmp/downloaded_map.json"
cat /tmp/downloaded_map.json
echo ""

# Test 6: Test pagination
echo "Test 6: Test pagination (page_size=1)"
echo "-----------------------------------"
curl -X GET "${BASE_URL}/v0.1/filestorage/${PROJECT_ID}/map/list?page=1&page_size=1" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq .
echo ""

echo "=== All tests completed ==="
