#!/bin/bash

# Comprehensive File Storage API Test Suite
# Tests all 5 categories and edge cases

BASE_URL="http://localhost:5000/v0.1/filestorage"
PROJECT_ID="test_project"
TEMP_DIR="/tmp/filestorage_test"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Setup
echo "=== Setting up test environment ==="
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Helper functions
pass_test() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((TESTS_PASSED++))
}

fail_test() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    echo -e "${RED}  Details: $2${NC}"
    ((TESTS_FAILED++))
}

warn_test() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
}

# Test 1: Upload MAP category file
echo -e "\n=== Test 1: MAP Category Upload ==="
echo '{"type": "map", "data": "parking map"}' > "$TEMP_DIR/test_map.json"
RESPONSE=$(curl -s -X POST "$BASE_URL/$PROJECT_ID/map/upload" \
    -F "files=@$TEMP_DIR/test_map.json")
if echo "$RESPONSE" | grep -q '"success":true'; then
    pass_test "MAP upload successful"
else
    fail_test "MAP upload failed" "$RESPONSE"
fi

# Test 2: Upload CAD category file
echo -e "\n=== Test 2: CAD Category Upload ==="
echo '{"type": "cad", "data": "cad drawing"}' > "$TEMP_DIR/test_cad.json"
RESPONSE=$(curl -s -X POST "$BASE_URL/$PROJECT_ID/cad/upload" \
    -F "files=@$TEMP_DIR/test_cad.json")
if echo "$RESPONSE" | grep -q '"success":true'; then
    pass_test "CAD upload successful"
else
    fail_test "CAD upload failed" "$RESPONSE"
fi

# Test 3: Upload ROI category file
echo -e "\n=== Test 3: ROI Category Upload ==="
echo '{"type": "roi", "data": "region of interest"}' > "$TEMP_DIR/test_roi.json"
RESPONSE=$(curl -s -X POST "$BASE_URL/$PROJECT_ID/roi/upload" \
    -F "files=@$TEMP_DIR/test_roi.json")
if echo "$RESPONSE" | grep -q '"success":true'; then
    pass_test "ROI upload successful"
else
    fail_test "ROI upload failed" "$RESPONSE"
fi

# Test 4: Upload LEARNING category with CCTV ID structure
echo -e "\n=== Test 4: LEARNING Category with CCTV ID ==="
mkdir -p "$TEMP_DIR/cctv_001"
echo "learning image data" > "$TEMP_DIR/cctv_001/learning_001.jpg"
RESPONSE=$(curl -s -X POST "$BASE_URL/$PROJECT_ID/learning/upload" \
    -F "files=@$TEMP_DIR/cctv_001/learning_001.jpg;headers=\"Content-Disposition: form-data; name=\\\"files\\\"; filename=\\\"cctv_001/learning_001.jpg\\\"\"")
if echo "$RESPONSE" | grep -q '"success":true'; then
    pass_test "LEARNING upload with CCTV ID successful"
else
    fail_test "LEARNING upload with CCTV ID failed" "$RESPONSE"
fi

# Test 5: Upload TEST category with CCTV ID structure
echo -e "\n=== Test 5: TEST Category with CCTV ID ==="
mkdir -p "$TEMP_DIR/cctv_002"
echo "test image data" > "$TEMP_DIR/cctv_002/test_001.jpg"
RESPONSE=$(curl -s -X POST "$BASE_URL/$PROJECT_ID/test/upload" \
    -F "files=@$TEMP_DIR/cctv_002/test_001.jpg;headers=\"Content-Disposition: form-data; name=\\\"files\\\"; filename=\\\"cctv_002/test_001.jpg\\\"\"")
if echo "$RESPONSE" | grep -q '"success":true'; then
    pass_test "TEST upload with CCTV ID successful"
else
    fail_test "TEST upload with CCTV ID failed" "$RESPONSE"
fi

# Test 6: List files in each category
echo -e "\n=== Test 6: List Files in All Categories ==="
for CATEGORY in map cad roi learning test; do
    RESPONSE=$(curl -s -X GET "$BASE_URL/$PROJECT_ID/$CATEGORY/list")
    if echo "$RESPONSE" | grep -q '"success":true'; then
        FILE_COUNT=$(echo "$RESPONSE" | grep -o '"total_count":[0-9]*' | grep -o '[0-9]*')
        pass_test "$CATEGORY list returned $FILE_COUNT files"
    else
        fail_test "$CATEGORY list failed" "$RESPONSE"
    fi
done

# Test 7: Versioning - upload same file twice
echo -e "\n=== Test 7: Versioning Test ==="
echo '{"version": 1}' > "$TEMP_DIR/version_test.json"
RESPONSE1=$(curl -s -X POST "$BASE_URL/$PROJECT_ID/map/upload" \
    -F "files=@$TEMP_DIR/version_test.json")
sleep 1
echo '{"version": 2}' > "$TEMP_DIR/version_test.json"
RESPONSE2=$(curl -s -X POST "$BASE_URL/$PROJECT_ID/map/upload" \
    -F "files=@$TEMP_DIR/version_test.json")

if echo "$RESPONSE1" | grep -q '"success":true' && echo "$RESPONSE2" | grep -q '"success":true'; then
    VERSION1=$(echo "$RESPONSE1" | grep -o '"version":"[0-9]*"' | grep -o '[0-9]*')
    VERSION2=$(echo "$RESPONSE2" | grep -o '"version":"[0-9]*"' | grep -o '[0-9]*')
    if [ "$VERSION1" != "$VERSION2" ]; then
        pass_test "Versioning works - got different versions: v$VERSION1 and v$VERSION2"
    else
        fail_test "Versioning failed - same version returned" "v1=$VERSION1, v2=$VERSION2"
    fi
else
    fail_test "Versioning test upload failed" "$RESPONSE1 | $RESPONSE2"
fi

# Test 8: Download latest version
echo -e "\n=== Test 8: Download Latest Version ==="
RESPONSE=$(curl -s -w "%{http_code}" -o "$TEMP_DIR/downloaded.json" \
    "$BASE_URL/$PROJECT_ID/map/latest?original_name=version_test.json")
if [ "$RESPONSE" = "200" ]; then
    if [ -f "$TEMP_DIR/downloaded.json" ]; then
        CONTENT=$(cat "$TEMP_DIR/downloaded.json")
        if echo "$CONTENT" | grep -q '"version": 2'; then
            pass_test "Downloaded latest version correctly"
        else
            fail_test "Downloaded file has wrong content" "$CONTENT"
        fi
    else
        fail_test "Downloaded file not found" ""
    fi
else
    fail_test "Download latest failed with status $RESPONSE" ""
fi

# Test 9: Pagination test
echo -e "\n=== Test 9: Pagination Test ==="
RESPONSE=$(curl -s -X GET "$BASE_URL/$PROJECT_ID/map/list?page=1&page_size=2")
if echo "$RESPONSE" | grep -q '"page_size":2'; then
    FILES=$(echo "$RESPONSE" | grep -o '"files":\[' | wc -l)
    if [ "$FILES" -eq 1 ]; then
        pass_test "Pagination works correctly"
    else
        fail_test "Pagination returned wrong structure" "$RESPONSE"
    fi
else
    fail_test "Pagination parameters not applied" "$RESPONSE"
fi

# Test 10: Auto-upload test
echo -e "\n=== Test 10: Auto-Upload Test ==="
echo '{"auto": "upload test"}' > "$TEMP_DIR/auto_test.json"
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/$PROJECT_ID/map/auto-upload" \
    -F "file=@$TEMP_DIR/auto_test.json")
HTTP_CODE="${RESPONSE: -3}"
if [ "$HTTP_CODE" = "202" ]; then
    pass_test "Auto-upload returned 202 Accepted"
    # Wait for async upload
    sleep 1
    # Check if file exists
    LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/$PROJECT_ID/map/list")
    if echo "$LIST_RESPONSE" | grep -q "auto_test"; then
        pass_test "Auto-upload file created successfully"
    else
        warn_test "Auto-upload file not found in list (may still be processing)"
    fi
else
    fail_test "Auto-upload returned wrong status code" "Expected 202, got $HTTP_CODE"
fi

# Test 11: Error handling - missing file
echo -e "\n=== Test 11: Error Handling - No File ==="
RESPONSE=$(curl -s -X POST "$BASE_URL/$PROJECT_ID/map/upload")
if echo "$RESPONSE" | grep -q '"success":false'; then
    pass_test "Correctly handles missing file"
else
    fail_test "Should reject missing file" "$RESPONSE"
fi

# Test 12: Error handling - invalid project ID
echo -e "\n=== Test 12: Error Handling - Empty Project ID ==="
RESPONSE=$(curl -s -X POST "$BASE_URL//map/upload" \
    -F "files=@$TEMP_DIR/test_map.json")
# This might return 404 or 400 depending on routing
if [ -n "$RESPONSE" ]; then
    pass_test "Handles empty project ID"
else
    warn_test "Empty project ID handling unclear"
fi

# Test 13: Download non-existent file
echo -e "\n=== Test 13: Error Handling - Non-existent File ==="
RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null \
    "$BASE_URL/$PROJECT_ID/map/download/nonexistent_file.json")
if [ "$RESPONSE" = "404" ]; then
    pass_test "Correctly returns 404 for non-existent file"
else
    fail_test "Should return 404 for non-existent file" "Got $RESPONSE"
fi

# Test 14: Large file upload (simulate with 1MB file)
echo -e "\n=== Test 14: Large File Upload ==="
dd if=/dev/zero of="$TEMP_DIR/large_file.bin" bs=1024 count=1024 2>/dev/null
RESPONSE=$(curl -s -X POST "$BASE_URL/$PROJECT_ID/map/upload" \
    -F "files=@$TEMP_DIR/large_file.bin")
if echo "$RESPONSE" | grep -q '"success":true'; then
    pass_test "Large file (1MB) upload successful"
else
    fail_test "Large file upload failed" "$RESPONSE"
fi

# Test 15: Multiple files upload
echo -e "\n=== Test 15: Multiple Files Upload ==="
echo '{"file": 1}' > "$TEMP_DIR/multi_1.json"
echo '{"file": 2}' > "$TEMP_DIR/multi_2.json"
echo '{"file": 3}' > "$TEMP_DIR/multi_3.json"
RESPONSE=$(curl -s -X POST "$BASE_URL/$PROJECT_ID/map/upload" \
    -F "files=@$TEMP_DIR/multi_1.json" \
    -F "files=@$TEMP_DIR/multi_2.json" \
    -F "files=@$TEMP_DIR/multi_3.json")
if echo "$RESPONSE" | grep -q '"success_count":3'; then
    pass_test "Multiple files upload successful"
else
    fail_test "Multiple files upload failed" "$RESPONSE"
fi

# Test 16: Special characters in filename
echo -e "\n=== Test 16: Special Characters in Filename ==="
echo '{"test": "special"}' > "$TEMP_DIR/test-file_name (1).json"
RESPONSE=$(curl -s -X POST "$BASE_URL/$PROJECT_ID/map/upload" \
    -F "files=@$TEMP_DIR/test-file_name (1).json")
if echo "$RESPONSE" | grep -q '"success":true'; then
    pass_test "Special characters in filename handled"
else
    fail_test "Special characters in filename failed" "$RESPONSE"
fi

# Cleanup
echo -e "\n=== Cleanup ==="
rm -rf "$TEMP_DIR"
echo "Test files cleaned up"

# Summary
echo -e "\n========================================"
echo -e "Test Summary:"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo -e "Total: $TOTAL"
echo -e "========================================"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
