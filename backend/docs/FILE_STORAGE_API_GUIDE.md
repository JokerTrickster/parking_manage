# File Storage API 사용 가이드

## 목차

1. [개요](#개요)
2. [시작하기](#시작하기)
3. [카테고리별 사용법](#카테고리별-사용법)
4. [공통 기능](#공통-기능)
5. [에러 처리](#에러-처리)
6. [실전 예제](#실전-예제)
7. [FAQ](#faq)

---

## 개요

File Storage API는 주차장 관리 시스템의 다양한 파일 타입을 저장하고 관리하기 위한 RESTful API입니다.

### 지원하는 파일 카테고리

| 카테고리 | 설명 | 버전 관리 | 폴더 구조 |
|---------|------|----------|---------|
| `map` | 주차장 지도 JSON | ✅ 자동 | 단일 디렉토리 |
| `cad` | CAD 도면 파일 | ✅ 자동 | 단일 디렉토리 |
| `roi` | ROI 영역 JSON | ✅ 자동 | 단일 디렉토리 |
| `learning` | 학습 이미지 | ❌ 없음 | CCTV ID별 폴더 |
| `test` | 테스트 이미지 | ❌ 없음 | CCTV ID별 폴더 |

### 주요 기능

- ✅ **자동 버전 관리**: map/cad/roi 파일은 타임스탬프로 자동 버전 관리
- ✅ **폴더 구조 보존**: learning/test 이미지는 CCTV ID 폴더 구조 유지
- ✅ **다중 파일 업로드**: 한 번에 여러 파일 업로드 가능
- ✅ **페이지네이션**: 대용량 파일 목록을 효율적으로 조회
- ✅ **스트리밍 다운로드**: 메모리 효율적인 파일 다운로드
- ✅ **비동기 자동 업로드**: 맵 에디터 연동을 위한 fire-and-forget 업로드

---

## 시작하기

### 기본 정보

- **Base URL**: `http://localhost:5000/v0.1/filestorage`
- **인증**: 현재 인증 불필요 (추후 JWT 추가 예정)
- **Content-Type**: `multipart/form-data` (업로드), `application/json` (응답)

### Swagger 문서

개발 환경에서는 Swagger UI를 통해 API를 테스트할 수 있습니다:

```
http://localhost:5000/swagger/index.html
```

### 빠른 시작 예제

```bash
# 1. 맵 파일 업로드
curl -X POST "http://localhost:5000/v0.1/filestorage/banpo/map/upload" \
  -F "files=@parking_map.json"

# 2. 파일 목록 조회
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/map/list"

# 3. 최신 버전 다운로드
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/map/latest?original_name=parking_map.json" \
  -o downloaded_map.json
```

---

## 카테고리별 사용법

### 1. MAP (지도 파일)

맵 에디터에서 생성한 주차장 지도 JSON 파일을 관리합니다.

#### 업로드

```bash
# 단일 파일 업로드
curl -X POST "http://localhost:5000/v0.1/filestorage/banpo/map/upload" \
  -F "files=@parking_map.json"

# 응답
{
  "success": true,
  "message": "files uploaded successfully",
  "data": {
    "total_files": 1,
    "success_count": 1,
    "failed_count": 0,
    "version": "1761551004",
    "uploaded_files": [
      {
        "filename": "parking_map_1761551004.json",
        "original_name": "parking_map.json",
        "version": "1761551004",
        "size_bytes": 2048,
        "upload_date": "2025-10-27T16:43:24+09:00",
        "file_type": "application/json"
      }
    ]
  }
}
```

#### 목록 조회

```bash
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/map/list?page=1&page_size=10"

# 응답
{
  "success": true,
  "message": "files retrieved successfully",
  "data": {
    "total_count": 3,
    "files": [
      {
        "filename": "parking_map_1761551004.json",
        "original_name": "parking_map.json",
        "version": "1761551004",
        "size_bytes": 2048,
        "upload_date": "2025-10-27T16:43:24+09:00",
        "file_type": "application/json"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total_pages": 1
    }
  }
}
```

#### 최신 버전 다운로드

```bash
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/map/latest?original_name=parking_map.json" \
  -o parking_map.json
```

#### 특정 버전 다운로드

```bash
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/map/download/parking_map_1761551004.json" \
  -o parking_map_v1.json
```

### 2. CAD (CAD 도면 파일)

CAD 도면 파일을 관리합니다. 사용법은 MAP과 동일합니다.

```bash
# 업로드
curl -X POST "http://localhost:5000/v0.1/filestorage/banpo/cad/upload" \
  -F "files=@parking_layout.dxf"

# 목록 조회
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/cad/list"

# 최신 버전 다운로드
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/cad/latest?original_name=parking_layout.dxf" \
  -o parking_layout.dxf
```

### 3. ROI (관심 영역 파일)

ROI 설정 JSON 파일을 관리합니다. 사용법은 MAP과 동일합니다.

```bash
# 업로드
curl -X POST "http://localhost:5000/v0.1/filestorage/banpo/roi/upload" \
  -F "files=@roi_config.json"

# 목록 조회
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/roi/list"

# 최신 버전 다운로드
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/roi/latest?original_name=roi_config.json" \
  -o roi_config.json
```

### 4. LEARNING (학습 이미지)

딥러닝 모델 학습을 위한 CCTV 이미지를 CCTV ID별로 관리합니다.

#### 폴더 구조

```
shared/banpo/learning/
├── cctv_001/
│   ├── image_001.jpg
│   ├── image_002.jpg
│   └── image_003.jpg
├── cctv_002/
│   ├── image_001.jpg
│   └── image_002.jpg
└── cctv_003/
    └── image_001.jpg
```

#### 업로드 (폴더 구조 보존)

```bash
# 단일 CCTV의 이미지 업로드
curl -X POST "http://localhost:5000/v0.1/filestorage/banpo/learning/upload" \
  -F "files=@cctv_001/image_001.jpg;headers=\"Content-Disposition: form-data; name=\\\"files\\\"; filename=\\\"cctv_001/image_001.jpg\\\"\"" \
  -F "files=@cctv_001/image_002.jpg;headers=\"Content-Disposition: form-data; name=\\\"files\\\"; filename=\\\"cctv_001/image_002.jpg\\\"\""
```

#### 목록 조회 (CCTV ID 필터링)

```bash
# 전체 목록
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/learning/list"

# 특정 CCTV ID만 조회
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/learning/list?cctv_id=cctv_001"
```

#### 다운로드

```bash
# 특정 파일 다운로드
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/learning/download/cctv_001/image_001.jpg" \
  -o image_001.jpg
```

### 5. TEST (테스트 이미지)

테스트용 CCTV 이미지를 관리합니다. 사용법은 LEARNING과 동일합니다.

```bash
# 업로드
curl -X POST "http://localhost:5000/v0.1/filestorage/banpo/test/upload" \
  -F "files=@cctv_001/test_001.jpg;headers=\"Content-Disposition: form-data; name=\\\"files\\\"; filename=\\\"cctv_001/test_001.jpg\\\"\""

# CCTV ID별 조회
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/test/list?cctv_id=cctv_001"
```

---

## 공통 기능

### 1. 다중 파일 업로드

모든 카테고리에서 여러 파일을 동시에 업로드할 수 있습니다.

```bash
curl -X POST "http://localhost:5000/v0.1/filestorage/banpo/map/upload" \
  -F "files=@map_1.json" \
  -F "files=@map_2.json" \
  -F "files=@map_3.json"

# 응답
{
  "success": true,
  "message": "files uploaded successfully",
  "data": {
    "total_files": 3,
    "success_count": 3,
    "failed_count": 0,
    "uploaded_files": [ ... ]
  }
}
```

### 2. 페이지네이션

대량의 파일을 효율적으로 조회할 수 있습니다.

```bash
# 첫 번째 페이지 (20개씩)
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/map/list?page=1&page_size=20"

# 두 번째 페이지
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/map/list?page=2&page_size=20"

# 응답
{
  "data": {
    "total_count": 45,
    "files": [ ... ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_pages": 3
    }
  }
}
```

### 3. 버전 관리 (MAP/CAD/ROI만 해당)

동일한 파일을 여러 번 업로드하면 자동으로 버전이 생성됩니다.

```bash
# 첫 번째 업로드
curl -X POST "http://localhost:5000/v0.1/filestorage/banpo/map/upload" \
  -F "files=@parking_map.json"
# -> parking_map_1761551004.json

# 수정 후 두 번째 업로드 (같은 파일명)
curl -X POST "http://localhost:5000/v0.1/filestorage/banpo/map/upload" \
  -F "files=@parking_map.json"
# -> parking_map_1761551100.json

# 모든 버전 조회
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/map/list"
# -> 두 버전 모두 표시됨

# 최신 버전만 다운로드
curl -X GET "http://localhost:5000/v0.1/filestorage/banpo/map/latest?original_name=parking_map.json"
# -> parking_map_1761551100.json 다운로드
```

### 4. 맵 에디터 자동 업로드

맵 에디터에서 비동기로 자동 저장할 수 있는 특별한 엔드포인트입니다.

```bash
curl -X POST "http://localhost:5000/v0.1/filestorage/banpo/map/auto-upload" \
  -F "file=@parking_map.json"

# 즉시 응답 (202 Accepted)
{
  "success": true,
  "message": "upload initiated",
  "data": {
    "project_id": "banpo",
    "filename": "parking_map.json"
  }
}
# 실제 업로드는 백그라운드에서 처리됨
```

**특징:**
- 즉시 `202 Accepted` 응답 (클라이언트 차단 없음)
- 백그라운드에서 파일 저장
- 에러는 서버 로그에만 기록
- 자동 버전 관리 적용

**상세 가이드:** [MAP_EDITOR_AUTO_UPLOAD.md](./MAP_EDITOR_AUTO_UPLOAD.md)

---

## 에러 처리

### HTTP 상태 코드

| 코드 | 설명 | 대처 방법 |
|------|------|----------|
| 200 | 성공 | - |
| 202 | 요청 수락 (비동기 처리) | 백그라운드 처리 완료 대기 |
| 400 | 잘못된 요청 | 요청 파라미터 확인 |
| 404 | 파일 없음 | 파일명 및 경로 확인 |
| 500 | 서버 오류 | 서버 로그 확인 |

### 일반적인 에러

#### 1. 파일이 제공되지 않음

```json
{
  "success": false,
  "message": "no files provided"
}
```

**해결:** `files` 필드명 확인, 파일 첨부 확인

#### 2. 잘못된 카테고리

```json
{
  "success": false,
  "message": "invalid category: xxx"
}
```

**해결:** 카테고리를 `map`, `cad`, `roi`, `learning`, `test` 중 하나로 변경

#### 3. 파일을 찾을 수 없음

```json
{
  "success": false,
  "message": "file not found: ..."
}
```

**해결:** 파일 목록 API로 실제 파일명 확인 후 재시도

#### 4. 프로젝트 ID 누락

```json
{
  "success": false,
  "message": "projectId is required"
}
```

**해결:** URL에 프로젝트 ID 추가

---

## 실전 예제

### 예제 1: 맵 에디터 통합

```javascript
// 맵 에디터에서 저장 버튼 클릭 시
async function saveMap(projectId, mapData) {
  const blob = new Blob([JSON.stringify(mapData, null, 2)], {
    type: 'application/json'
  });
  const file = new File([blob], 'parking_map.json', {
    type: 'application/json'
  });

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
      console.log('맵 저장 시작됨 (백그라운드 처리)');
      // 사용자는 계속 작업 가능
    }
  } catch (error) {
    console.error('저장 실패:', error);
    alert('저장 요청 실패');
  }
}
```

### 예제 2: 버전 히스토리 조회

```python
import requests

def get_version_history(project_id, original_filename):
    """특정 파일의 모든 버전 조회"""
    url = f"http://localhost:5000/v0.1/filestorage/{project_id}/map/list"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        files = data['data']['files']

        # 원본 파일명으로 필터링
        versions = [
            f for f in files
            if f['original_name'] == original_filename
        ]

        # 버전별로 정렬 (최신순)
        versions.sort(key=lambda x: x['version'], reverse=True)

        return versions
    else:
        raise Exception(f"조회 실패: {response.status_code}")

# 사용 예
versions = get_version_history('banpo', 'parking_map.json')
for v in versions:
    print(f"버전: {v['version']}, 업로드: {v['upload_date']}, 크기: {v['size_bytes']} bytes")
```

### 예제 3: 학습 이미지 일괄 업로드

```bash
#!/bin/bash

PROJECT_ID="banpo"
CCTV_DIR="./cctv_images/cctv_001"

# cctv_001 폴더의 모든 이미지를 업로드
for image in "$CCTV_DIR"/*.jpg; do
  filename=$(basename "$image")
  curl -X POST "http://localhost:5000/v0.1/filestorage/$PROJECT_ID/learning/upload" \
    -F "files=@$image;headers=\"Content-Disposition: form-data; name=\\\"files\\\"; filename=\\\"cctv_001/$filename\\\"\""
done

echo "모든 이미지 업로드 완료"
```

### 예제 4: 파일 다운로드 및 로컬 저장

```python
import requests

def download_latest_map(project_id, original_filename, save_path):
    """최신 맵 파일 다운로드"""
    url = f"http://localhost:5000/v0.1/filestorage/{project_id}/map/latest"
    params = {'original_name': original_filename}

    response = requests.get(url, params=params, stream=True)

    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"다운로드 완료: {save_path}")
        return True
    else:
        print(f"다운로드 실패: {response.status_code}")
        return False

# 사용 예
download_latest_map('banpo', 'parking_map.json', './downloaded_map.json')
```

### 예제 5: CCTV ID별 이미지 목록 조회

```javascript
async function getCctvImages(projectId, cctvId, category = 'learning') {
  const url = `http://localhost:5000/v0.1/filestorage/${projectId}/${category}/list?cctv_id=${cctvId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      const images = data.data.files;
      console.log(`${cctvId}의 이미지 ${images.length}개 발견`);
      return images;
    }
  } catch (error) {
    console.error('조회 실패:', error);
    return [];
  }
}

// 사용 예
const images = await getCctvImages('banpo', 'cctv_001', 'learning');
images.forEach(img => {
  console.log(`파일: ${img.filename}, 크기: ${img.size_bytes} bytes`);
});
```

---

## FAQ

### Q1. 같은 파일을 여러 번 업로드하면 어떻게 되나요?

**A:** 카테고리에 따라 다릅니다:

- **MAP/CAD/ROI**: 타임스탬프 접미사가 추가되어 새 버전으로 저장됩니다
  - `parking_map.json` → `parking_map_1761551004.json`
- **LEARNING/TEST**: 덮어쓰기됩니다 (버전 관리 없음)

### Q2. 업로드할 수 있는 파일 크기 제한은?

**A:** 현재 서버 설정은 10MB입니다. 필요시 `MAX_FILE_SIZE` 환경 변수로 조정 가능합니다.

### Q3. 파일 삭제 기능이 있나요?

**A:** 현재 버전에는 삭제 API가 없습니다. 서버 파일 시스템에서 직접 삭제하거나, 향후 업데이트에서 삭제 API가 추가될 예정입니다.

### Q4. 여러 프로젝트를 동시에 관리할 수 있나요?

**A:** 네, 각 프로젝트는 별도의 디렉토리에 저장됩니다:
- `shared/banpo/map/`
- `shared/osong/map/`
- `shared/test_project/map/`

### Q5. 버전 번호는 어떻게 생성되나요?

**A:** Unix 타임스탬프(초 단위)를 사용합니다:
- `1761551004` → 2025년 10월 27일 16:43:24
- 정렬 및 비교가 쉽고, 충돌이 거의 없습니다

### Q6. 파일 목록이 날짜순으로 정렬되나요?

**A:** 네, 기본적으로 **최신 파일이 먼저** 표시됩니다 (내림차순).

### Q7. 비동기 자동 업로드가 실패하면 어떻게 알 수 있나요?

**A:** 현재는 서버 로그에만 기록됩니다. 프로덕션 환경에서는 웹훅이나 모니터링 시스템 연동을 권장합니다.

### Q8. CCTV ID는 어떤 형식이어야 하나요?

**A:** 특별한 제한은 없지만, 일반적으로 `cctv_001`, `cctv_002` 형식을 사용합니다.

### Q9. Swagger UI에서 파일 업로드를 테스트할 수 있나요?

**A:** 네, `http://localhost:5000/swagger/index.html`에서 각 엔드포인트의 "Try it out" 버튼으로 테스트 가능합니다.

### Q10. 프로덕션 환경에서 주의할 점은?

**A:** 다음 사항을 고려하세요:
- JWT 인증 추가
- Rate limiting 설정
- 파일 타입 및 크기 검증 강화
- 디스크 용량 모니터링
- 오래된 버전 자동 정리 정책

---

## 추가 리소스

- [Swagger API 문서](http://localhost:5000/swagger/index.html)
- [맵 에디터 자동 업로드 가이드](./MAP_EDITOR_AUTO_UPLOAD.md)
- [백엔드 소스 코드](../src/features/filestorage/)

## 문의

문제가 발생하거나 기능 요청이 있으시면 개발팀에 문의해주세요.
