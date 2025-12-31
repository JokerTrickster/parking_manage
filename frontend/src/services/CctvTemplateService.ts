import { CctvTemplate } from '../models/CctvTemplate';
import banpoTemplate from '../config/cctvTemplates/banpo.json';
import osongTemplate from '../config/cctvTemplates/osong.json';

export class CctvTemplateService {
  private static templates: Map<string, CctvTemplate> = new Map([
    ['banpo', banpoTemplate as CctvTemplate],
    ['osong', osongTemplate as CctvTemplate]
  ]);

  /**
   * 프로젝트 ID로 CCTV 템플릿 조회
   */
  static getTemplateByProjectId(projectId: string): CctvTemplate | null {
    if (!projectId) {
      console.warn('getTemplateByProjectId: projectId is null or undefined');
      return null;
    }
    const template = this.templates.get(projectId.toLowerCase());
    if (!template) {
      console.warn(`프로젝트 "${projectId}"에 대한 CCTV 템플릿을 찾을 수 없습니다.`);
      return null;
    }
    return template;
  }

  /**
   * 사용 가능한 모든 프로젝트 ID 목록 조회
   */
  static getAvailableProjectIds(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * 프로젝트에 템플릿이 존재하는지 확인
   */
  static hasTemplate(projectId: string): boolean {
    return this.templates.has(projectId.toLowerCase());
  }

  /**
   * 특정 CCTV의 이미지 URL 생성
   */
  static getCctvImageUrl(
    baseUrl: string,
    projectId: string,
    cctvId: string,
    imageType: string
  ): string {
    const template = this.getTemplateByProjectId(projectId);
    if (!template) {
      throw new Error(`프로젝트 "${projectId}"의 템플릿을 찾을 수 없습니다.`);
    }

    const cctv = template.cctvList.find(c => c.cctvId === cctvId);
    if (!cctv) {
      throw new Error(`CCTV "${cctvId}"를 찾을 수 없습니다.`);
    }

    const imageConfig = cctv.images.find(img => img.type === imageType);
    if (!imageConfig) {
      throw new Error(`이미지 타입 "${imageType}"을 찾을 수 없습니다.`);
    }

    // 템플릿에 정의된 endpoint를 직접 사용 (캐시 방지 타임스탬프 추가)
    const timestamp = new Date().getTime();
    return `${imageConfig.endpoint}?t=${timestamp}`;
  }
}
