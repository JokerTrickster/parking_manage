import axios from 'axios';
import { axiosConfig, API_ENDPOINTS } from '../config/api';
import {
  CreateRoiRequest,
  ReadRoiRequest,
  UpdateRoiRequest,
  DeleteRoiRequest,
  RoiResponse,
  ReadRoiResponse,
  TestStatsRoiResponse,
  DraftRoiResponse,
  SaveDraftResponse
} from '../models/Roi';

const api = axios.create(axiosConfig);

export class RoiService {
  // 테스트 폴더 목록 조회
  static async getTestFolders(projectId: string): Promise<any[]> {
    const response = await api.get(API_ENDPOINTS.GET_TEST_FOLDERS(projectId));
    return response.data.folders || response.data || [];
  }

  // 특정 폴더의 이미지 목록 조회
  static async getTestImages(projectId: string, folderPath: string): Promise<TestStatsRoiResponse> {
    const response = await api.get(API_ENDPOINTS.GET_ROI_IMAGES(projectId, folderPath));
    return response.data;
  }

  // ROI 파일 목록 조회
  static async getRoiFiles(projectId: string): Promise<any[]> {
    const response = await api.get(API_ENDPOINTS.GET_ROI_FOLDERS(projectId));
    return response.data.folders || response.data || [];
  }

  // ROI Draft 생성
  static async createDraftRoi(projectId: string, roiFileName: string): Promise<RoiResponse> {
    const response = await api.post(API_ENDPOINTS.CREATE_DRAFT_ROI(projectId, roiFileName));
    return response.data;
  }

  // ROI Draft 조회
  static async getDraftRoi(projectId: string, roiFileName: string): Promise<DraftRoiResponse> {
    const response = await api.get(API_ENDPOINTS.GET_DRAFT_ROI(projectId, roiFileName));
    return response.data;
  }

  // ROI Draft 저장
  static async saveDraftRoi(projectId: string, roiFileName: string): Promise<SaveDraftResponse> {
    const response = await api.post(API_ENDPOINTS.SAVE_DRAFT_ROI(projectId, roiFileName));
    return response.data;
  }

  // ROI 생성
  static async createRoi(projectId: string, request: CreateRoiRequest): Promise<RoiResponse> {
    const response = await api.post(API_ENDPOINTS.CREATE_ROI(projectId), request);
    return response.data;
  }

  // ROI 읽기
  static async readRoi(projectId: string, request: ReadRoiRequest): Promise<ReadRoiResponse> {
    const response = await api.post(API_ENDPOINTS.READ_ROI(projectId), request);
    return response.data;
  }

  // ROI 수정
  static async updateRoi(projectId: string, request: UpdateRoiRequest): Promise<RoiResponse> {
    const response = await api.put(API_ENDPOINTS.UPDATE_ROI(projectId), request);
    return response.data;
  }

  // ROI 삭제
  static async deleteRoi(projectId: string, request: DeleteRoiRequest): Promise<RoiResponse> {
    const response = await api.delete(API_ENDPOINTS.DELETE_ROI(projectId), { data: request });
    return response.data;
  }
}
