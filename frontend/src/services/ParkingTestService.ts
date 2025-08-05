import axios from 'axios';
import { ParkingTestRequest, ParkingTestResponse, SavedResult } from '../models/ParkingTest';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export class ParkingTestService {
  static async detectParking(request: ParkingTestRequest): Promise<ParkingTestResponse> {
    try {
      const response = await api.post('/detect-parking', request);
      return response.data;
    } catch (error) {
      console.error('주차 감지 실패:', error);
      throw error;
    }
  }

  static async getResults(): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await api.get('/results');
      return response.data;
    } catch (error) {
      console.error('결과 조회 실패:', error);
      throw error;
    }
  }

  static async getResult(timestamp: string): Promise<{ success: boolean; data: SavedResult }> {
    try {
      const response = await api.get(`/results/${timestamp}`);
      return response.data;
    } catch (error) {
      console.error('특정 결과 조회 실패:', error);
      throw error;
    }
  }
} 