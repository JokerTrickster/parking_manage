/**
 * Cross-Device Testing Utilities
 * Provides utilities for testing responsive design across different devices and screen sizes
 */

export interface DeviceProfile {
  name: string;
  category: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  pixelRatio: number;
  userAgent: string;
  orientation: 'portrait' | 'landscape';
  touchCapable: boolean;
  description: string;
}

export const DEVICE_PROFILES: DeviceProfile[] = [
  // Mobile Devices
  {
    name: 'iPhone 14 Pro',
    category: 'mobile',
    width: 393,
    height: 852,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    orientation: 'portrait',
    touchCapable: true,
    description: 'Latest iPhone with Dynamic Island'
  },
  {
    name: 'iPhone 14 Pro (Landscape)',
    category: 'mobile',
    width: 852,
    height: 393,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    orientation: 'landscape',
    touchCapable: true,
    description: 'iPhone 14 Pro in landscape mode'
  },
  {
    name: 'Samsung Galaxy S23',
    category: 'mobile',
    width: 360,
    height: 780,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    orientation: 'portrait',
    touchCapable: true,
    description: 'Popular Android flagship device'
  },
  {
    name: 'iPhone SE',
    category: 'mobile',
    width: 375,
    height: 667,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    orientation: 'portrait',
    touchCapable: true,
    description: 'Compact iPhone for small screen testing'
  },

  // Tablets
  {
    name: 'iPad Air',
    category: 'tablet',
    width: 820,
    height: 1180,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    orientation: 'portrait',
    touchCapable: true,
    description: 'Popular iPad model'
  },
  {
    name: 'iPad Air (Landscape)',
    category: 'tablet',
    width: 1180,
    height: 820,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    orientation: 'landscape',
    touchCapable: true,
    description: 'iPad Air in landscape mode'
  },
  {
    name: 'Samsung Galaxy Tab S8',
    category: 'tablet',
    width: 753,
    height: 1037,
    pixelRatio: 2.75,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-X706B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    orientation: 'portrait',
    touchCapable: true,
    description: 'Android tablet'
  },

  // Desktop
  {
    name: 'MacBook Air 13"',
    category: 'desktop',
    width: 1440,
    height: 900,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    orientation: 'landscape',
    touchCapable: false,
    description: 'Popular laptop resolution'
  },
  {
    name: 'MacBook Pro 14"',
    category: 'desktop',
    width: 1512,
    height: 982,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    orientation: 'landscape',
    touchCapable: false,
    description: 'High-resolution laptop'
  },
  {
    name: 'Dell 24" Monitor',
    category: 'desktop',
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    orientation: 'landscape',
    touchCapable: false,
    description: 'Standard desktop monitor'
  },
  {
    name: '4K Monitor',
    category: 'desktop',
    width: 3840,
    height: 2160,
    pixelRatio: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    orientation: 'landscape',
    touchCapable: false,
    description: 'Ultra-high resolution display'
  }
];

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  devices: string[];
  routes: string[];
  interactions: string[];
  expectedBehavior: string[];
}

export const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'navigation-test',
    name: '네비게이션 테스트',
    description: '모든 페이지 간 네비게이션이 올바르게 작동하는지 확인',
    devices: ['iPhone 14 Pro', 'iPad Air', 'MacBook Air 13"'],
    routes: ['/', '/roi-editor', '/parking-test', '/realtime-monitoring', '/project-file-repository', '/map-editor'],
    interactions: ['터치/클릭 네비게이션', '뒤로가기 버튼', '브레드크럼 네비게이션'],
    expectedBehavior: [
      '모든 페이지가 올바른 URL로 로드',
      '네비게이션 메뉴가 반응형으로 표시',
      '햄버거 메뉴가 모바일에서 작동'
    ]
  },
  {
    id: 'responsive-layout-test',
    name: '반응형 레이아웃 테스트',
    description: '다양한 화면 크기에서 레이아웃이 올바르게 적응하는지 확인',
    devices: ['iPhone SE', 'Samsung Galaxy S23', 'iPad Air', 'Dell 24" Monitor'],
    routes: ['/roi-editor', '/parking-test', '/realtime-monitoring'],
    interactions: ['화면 회전', '창 크기 조정', '줌 인/아웃'],
    expectedBehavior: [
      '컨텐츠가 화면 크기에 맞게 조정',
      '텍스트가 읽기 쉬운 크기로 표시',
      '터치 타겟이 최소 44px 크기',
      '스크롤 없이 중요한 콘텐츠 접근 가능'
    ]
  },
  {
    id: 'touch-interaction-test',
    name: '터치 인터랙션 테스트',
    description: '터치 기반 디바이스에서 모든 인터랙션이 올바르게 작동하는지 확인',
    devices: ['iPhone 14 Pro', 'Samsung Galaxy Tab S8', 'iPad Air'],
    routes: ['/roi-editor', '/parking-test'],
    interactions: ['버튼 탭', '스와이프', '다이얼로그 조작', '폼 입력'],
    expectedBehavior: [
      '모든 버튼이 터치에 반응',
      '터치 피드백이 적절히 제공',
      '다이얼로그가 터치로 조작 가능',
      '폼 필드가 터치 키보드와 호환'
    ]
  },
  {
    id: 'performance-test',
    name: '성능 테스트',
    description: '다양한 디바이스에서 성능이 일정 기준 이상인지 확인',
    devices: ['iPhone SE', 'Samsung Galaxy S23', 'iPad Air', 'MacBook Pro 14"'],
    routes: ['/', '/realtime-monitoring', '/project-file-repository'],
    interactions: ['페이지 로드', '데이터 로딩', '이미지 렌더링'],
    expectedBehavior: [
      '초기 페이지 로드 < 3초',
      'LCP (Largest Contentful Paint) < 2.5초',
      'FID (First Input Delay) < 100ms',
      'CLS (Cumulative Layout Shift) < 0.1'
    ]
  },
  {
    id: 'accessibility-test',
    name: '접근성 테스트',
    description: '접근성 기준을 만족하는지 확인',
    devices: ['iPhone 14 Pro', 'iPad Air', 'Dell 24" Monitor'],
    routes: ['/roi-editor', '/parking-test', '/project-file-repository'],
    interactions: ['스크린 리더', '키보드 네비게이션', '고대비 모드'],
    expectedBehavior: [
      '모든 이미지에 alt 텍스트',
      '키보드만으로 모든 기능 접근 가능',
      '적절한 색상 대비율 (4.5:1 이상)',
      'ARIA 라벨이 적절히 설정'
    ]
  }
];

/**
 * 현재 디바이스 정보를 감지하고 반환
 */
export const detectCurrentDevice = (): Partial<DeviceProfile> => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;
  const userAgent = navigator.userAgent;
  const touchCapable = 'ontouchstart' in window;

  let category: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (width < 768) category = 'mobile';
  else if (width < 1024) category = 'tablet';

  return {
    name: 'Current Device',
    category,
    width,
    height,
    pixelRatio,
    userAgent,
    orientation: width > height ? 'landscape' : 'portrait',
    touchCapable
  };
};

/**
 * 특정 디바이스 프로필로 뷰포트를 시뮬레이션
 */
export const simulateDevice = (deviceName: string): boolean => {
  const device = DEVICE_PROFILES.find(d => d.name === deviceName);
  if (!device) {
    console.warn(`Device profile not found: ${deviceName}`);
    return false;
  }

  // 브라우저 개발자 도구에서 디바이스 에뮬레이션을 사용하는 경우
  if ((window as any).chrome && (window as any).chrome.runtime) {
    console.log(`시뮬레이션 모드: ${device.name}`);
    console.log(`크기: ${device.width}x${device.height}`);
    console.log(`픽셀 비율: ${device.pixelRatio}`);
    console.log(`터치 지원: ${device.touchCapable}`);
    return true;
  }

  console.warn('디바이스 시뮬레이션은 브라우저 개발자 도구에서만 가능합니다.');
  return false;
};

/**
 * 반응형 브레이크포인트 테스트
 */
export const testBreakpoints = () => {
  const breakpoints = {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  };

  const current = window.innerWidth;
  const activeBreakpoint = Object.entries(breakpoints)
    .reverse()
    .find(([, width]) => current >= width)?.[0] || 'xs';

  console.log(`현재 브레이크포인트: ${activeBreakpoint} (${current}px)`);

  return {
    current: activeBreakpoint,
    width: current,
    breakpoints
  };
};

/**
 * 성능 메트릭 측정
 */
export const measurePerformance = (): Promise<{
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}> => {
  return new Promise((resolve) => {
    if ('PerformanceObserver' in window) {
      const metrics = {
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        ttfb: 0
      };

      // FCP (First Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            metrics.fcp = entry.startTime;
          }
        });
      }).observe({ entryTypes: ['paint'] });

      // LCP (Largest Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.lcp = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          metrics.fid = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            metrics.cls += entry.value;
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });

      // TTFB (Time to First Byte)
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      metrics.ttfb = navigation.responseStart - navigation.requestStart;

      setTimeout(() => resolve(metrics), 3000);
    } else {
      console.warn('PerformanceObserver not supported');
      resolve({
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        ttfb: 0
      });
    }
  });
};

/**
 * 접근성 체크리스트
 */
export const checkAccessibility = () => {
  const checks = {
    imagesHaveAltText: true,
    buttonsHaveLabels: true,
    formsHaveLabels: true,
    colorContrast: true,
    keyboardNavigation: true
  };

  // 이미지 alt 텍스트 체크
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      checks.imagesHaveAltText = false;
      console.warn('Image without alt text:', img);
    }
  });

  // 버튼 라벨 체크
  const buttons = document.querySelectorAll('button');
  buttons.forEach((button) => {
    if (!button.textContent?.trim() &&
        !button.getAttribute('aria-label') &&
        !button.getAttribute('aria-labelledby')) {
      checks.buttonsHaveLabels = false;
      console.warn('Button without label:', button);
    }
  });

  // 폼 라벨 체크
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const hasLabel = document.querySelector(`label[for="${input.id}"]`) ||
                     input.getAttribute('aria-label') ||
                     input.getAttribute('aria-labelledby');
    if (!hasLabel) {
      checks.formsHaveLabels = false;
      console.warn('Form element without label:', input);
    }
  });

  return checks;
};

export default {
  DEVICE_PROFILES,
  TEST_SCENARIOS,
  detectCurrentDevice,
  simulateDevice,
  testBreakpoints,
  measurePerformance,
  checkAccessibility
};