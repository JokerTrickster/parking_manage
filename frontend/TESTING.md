# Cross-Device Testing Guide

이 문서는 주차 관리 시스템의 크로스 디바이스 테스팅 가이드입니다.

## 📱 지원 디바이스

### 모바일 디바이스
- **iPhone 14 Pro** (393×852) - 최신 iOS 디바이스
- **iPhone SE** (375×667) - 소형 화면 테스트용
- **Samsung Galaxy S23** (360×780) - 안드로이드 대표 기기
- **iPhone 14 Pro (Landscape)** (852×393) - 가로 모드

### 태블릿
- **iPad Air** (820×1180) - 표준 태블릿 크기
- **iPad Air (Landscape)** (1180×820) - 태블릿 가로 모드
- **Samsung Galaxy Tab S8** (753×1037) - 안드로이드 태블릿

### 데스크톱
- **MacBook Air 13"** (1440×900) - 노트북 표준
- **MacBook Pro 14"** (1512×982) - 고해상도 노트북
- **Dell 24" Monitor** (1920×1080) - 표준 모니터
- **4K Monitor** (3840×2160) - 초고해상도 디스플레이

## 🧪 테스트 시나리오

### 1. 네비게이션 테스트
**목적**: 모든 페이지 간 네비게이션이 올바르게 작동하는지 확인

**테스트 디바이스**: iPhone 14 Pro, iPad Air, MacBook Air 13"

**테스트 경로**:
- `/` - 프로젝트 선택
- `/roi-editor` - ROI 편집기
- `/parking-test` - 주차 유효성 검사
- `/realtime-monitoring` - 실시간 모니터링
- `/project-file-repository` - 파일 보관함
- `/map-editor` - 맵 에디터

**상호작용**:
- 터치/클릭 네비게이션
- 뒤로가기 버튼
- 브레드크럼 네비게이션
- 햄버거 메뉴 (모바일)

**기대 결과**:
- ✅ 모든 페이지가 올바른 URL로 로드
- ✅ 네비게이션 메뉴가 반응형으로 표시
- ✅ 햄버거 메뉴가 모바일에서 작동

### 2. 반응형 레이아웃 테스트
**목적**: 다양한 화면 크기에서 레이아웃이 올바르게 적응하는지 확인

**테스트 디바이스**: iPhone SE, Samsung Galaxy S23, iPad Air, Dell 24" Monitor

**상호작용**:
- 화면 회전
- 창 크기 조정
- 줌 인/아웃

**기대 결과**:
- ✅ 컨텐츠가 화면 크기에 맞게 조정
- ✅ 텍스트가 읽기 쉬운 크기로 표시
- ✅ 터치 타겟이 최소 44px 크기
- ✅ 스크롤 없이 중요한 콘텐츠 접근 가능

### 3. 터치 인터랙션 테스트
**목적**: 터치 기반 디바이스에서 모든 인터랙션이 올바르게 작동하는지 확인

**테스트 디바이스**: iPhone 14 Pro, Samsung Galaxy Tab S8, iPad Air

**상호작용**:
- 버튼 탭
- 스와이프
- 다이얼로그 조작
- 폼 입력

**기대 결과**:
- ✅ 모든 버튼이 터치에 반응
- ✅ 터치 피드백이 적절히 제공
- ✅ 다이얼로그가 터치로 조작 가능
- ✅ 폼 필드가 터치 키보드와 호환

### 4. 성능 테스트
**목적**: 다양한 디바이스에서 성능이 일정 기준 이상인지 확인

**테스트 디바이스**: iPhone SE, Samsung Galaxy S23, iPad Air, MacBook Pro 14"

**측정 메트릭**:
- **FCP (First Contentful Paint)** < 1.8초
- **LCP (Largest Contentful Paint)** < 2.5초
- **FID (First Input Delay)** < 100ms
- **CLS (Cumulative Layout Shift)** < 0.1
- **TTFB (Time to First Byte)** < 600ms

### 5. 접근성 테스트
**목적**: 웹 접근성 기준을 만족하는지 확인

**체크리스트**:
- ✅ 모든 이미지에 alt 텍스트
- ✅ 키보드만으로 모든 기능 접근 가능
- ✅ 적절한 색상 대비율 (4.5:1 이상)
- ✅ ARIA 라벨이 적절히 설정
- ✅ 폼 요소에 라벨 연결

## 🛠️ 테스팅 도구 사용법

### 1. 개발자 도구에서 디바이스 시뮬레이션

1. 브라우저에서 F12 키를 눌러 개발자 도구 열기
2. 디바이스 모드 토글 (Ctrl+Shift+M 또는 Cmd+Shift+M)
3. 디바이스 목록에서 원하는 디바이스 선택
4. 화면 회전 및 터치 시뮬레이션 활성화

### 2. 테스팅 패널 사용

```typescript
import DeviceTestingPanel from '../components/DeviceTestingPanel';

// 컴포넌트에서 사용
const [testingOpen, setTestingOpen] = useState(false);

return (
  <>
    <Button onClick={() => setTestingOpen(true)}>
      디바이스 테스팅 열기
    </Button>
    <DeviceTestingPanel
      open={testingOpen}
      onClose={() => setTestingOpen(false)}
    />
  </>
);
```

### 3. 성능 측정

```javascript
import { measurePerformance } from '../utils/deviceTesting';

// 페이지 로드 후 성능 측정
const runPerformanceTest = async () => {
  const metrics = await measurePerformance();
  console.log('성능 메트릭:', metrics);
};
```

### 4. 접근성 검사

```javascript
import { checkAccessibility } from '../utils/deviceTesting';

// 현재 페이지의 접근성 검사
const results = checkAccessibility();
console.log('접근성 결과:', results);
```

## 📊 테스트 체크리스트

### 페이지별 테스트

#### 프로젝트 선택 페이지 (`/`)
- [ ] 프로젝트 카드 레이아웃이 반응형으로 표시
- [ ] 터치/클릭으로 프로젝트 선택 가능
- [ ] 로딩 상태 표시

#### ROI 편집기 (`/roi-editor`)
- [ ] 캔버스가 화면 크기에 맞게 조정
- [ ] 터치로 ROI 점 선택/편집 가능
- [ ] 모바일에서 컨트롤 패널이 다이얼로그로 표시
- [ ] 확대/축소 기능 작동

#### 주차 유효성 검사 (`/parking-test`)
- [ ] 탭 네비게이션이 모바일에서 적절히 표시
- [ ] 폼 입력이 터치 키보드와 호환
- [ ] 이미지가 반응형으로 표시
- [ ] 결과 표시가 읽기 쉬움

#### 실시간 모니터링 (`/realtime-monitoring`)
- [ ] 실시간 데이터가 지연 없이 업데이트
- [ ] CCTV 선택이 터치/클릭으로 가능
- [ ] 이미지 확대가 모든 디바이스에서 작동

#### 파일 보관함 (`/project-file-repository`)
- [ ] 파일 카테고리가 그리드로 적절히 표시
- [ ] 검색 및 필터가 모든 디바이스에서 작동
- [ ] 파일 업로드 진행률 표시
- [ ] 탭 네비게이션이 반응형

### 브라우저별 테스트

#### Chrome (Desktop & Mobile)
- [ ] 모든 기능 정상 작동
- [ ] 성능 메트릭 기준 충족
- [ ] 디바이스 모드 시뮬레이션 정확

#### Safari (Desktop & iOS)
- [ ] iOS 디바이스에서 터치 인터랙션 정상
- [ ] Safari 특정 CSS 속성 호환성
- [ ] PWA 기능 (있는 경우) 작동

#### Firefox
- [ ] 레이아웃 일관성
- [ ] 성능 차이 확인

#### Edge
- [ ] Windows 환경에서 정상 작동
- [ ] 터치 스크린 PC에서 하이브리드 인터랙션

## 🚀 자동화된 테스팅

### GitHub Actions를 통한 CI/CD 테스트

```yaml
# .github/workflows/cross-device-test.yml
name: Cross-Device Testing

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        viewport: [
          { width: 375, height: 667 },   # iPhone SE
          { width: 768, height: 1024 },  # iPad
          { width: 1440, height: 900 }   # Desktop
        ]

    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Run visual tests
        run: npm run test:visual -- --viewport=${{ matrix.viewport.width }}x${{ matrix.viewport.height }}
```

### Playwright를 사용한 E2E 테스트

```javascript
// tests/cross-device.spec.js
import { test, expect, devices } from '@playwright/test';

for (const [deviceName, device] of Object.entries(devices)) {
  test.describe(`${deviceName}`, () => {
    test.use({ ...device });

    test('should navigate between pages', async ({ page }) => {
      await page.goto('/');

      // 프로젝트 선택
      await page.click('[data-testid="project-card"]');
      await expect(page).toHaveURL('/roi-editor');

      // ROI 편집기 테스트
      await page.waitForSelector('canvas');
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('should handle responsive layout', async ({ page }) => {
      await page.goto('/roi-editor');

      if (device.isMobile) {
        // 모바일 전용 요소 확인
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      } else {
        // 데스크톱 전용 요소 확인
        await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible();
      }
    });
  });
}
```

## 📈 성능 최적화 가이드

### 모바일 최적화
- **이미지 최적화**: WebP 포맷 사용, 적절한 크기로 리사이징
- **코드 스플리팅**: 페이지별로 필요한 코드만 로드
- **레이지 로딩**: 이미지와 컴포넌트의 지연 로딩
- **캐싱**: Service Worker를 통한 리소스 캐싱

### 네트워크 최적화
- **번들 최적화**: Tree shaking으로 불필요한 코드 제거
- **CDN 사용**: 정적 자원의 빠른 배포
- **압축**: Gzip/Brotli 압축 활성화

## 🔧 문제 해결

### 일반적인 문제

1. **터치 이벤트 미작동**
   - `touch-action: none` CSS 속성 확인
   - 이벤트 리스너에 `{ passive: false }` 옵션 추가

2. **레이아웃 깨짐**
   - CSS Grid/Flexbox 브라우저 호환성 확인
   - `viewport` 메타 태그 설정 확인

3. **성능 저하**
   - 메모리 누수 확인 (DevTools Memory 탭)
   - 불필요한 리렌더링 최적화 (React.memo, useMemo)

4. **접근성 문제**
   - 스크린 리더 테스트 (NVDA, JAWS, VoiceOver)
   - 키보드 네비게이션 순서 확인

### 디버깅 도구

```javascript
// 디바이스 정보 출력
console.log('Device Info:', detectCurrentDevice());

// 성능 메트릭 모니터링
measurePerformance().then(metrics => {
  console.log('Performance:', metrics);
});

// 접근성 검사
const a11yResults = checkAccessibility();
console.log('Accessibility:', a11yResults);
```

## 📝 테스트 리포트 작성

각 테스트 완료 후 다음 형식으로 리포트를 작성하세요:

```markdown
# 테스트 리포트 - YYYY-MM-DD

## 테스트 환경
- 테스터: [이름]
- 날짜: [YYYY-MM-DD]
- 브라우저: [Chrome 112.0 등]
- 디바이스: [실제 디바이스 또는 시뮬레이션]

## 테스트 결과

### ✅ 통과한 테스트
- 네비게이션 테스트
- 반응형 레이아웃

### ❌ 실패한 테스트
- 성능 테스트 - LCP 3.2초 (기준: 2.5초)

### ⚠️ 개선 권장사항
- 이미지 최적화 필요
- 모바일에서 버튼 크기 확대 권장

## 스크린샷
[테스트 중 발견한 문제의 스크린샷 첨부]
```

이 가이드를 따라 체계적으로 크로스 디바이스 테스팅을 수행하면 모든 사용자에게 일관된 사용 경험을 제공할 수 있습니다.