export interface LearningRequest {
  projectId: string;
  learningRate: number;
  iterations: number;
  varThreshold: number;
  learningPath: string;
  testPath: string;
  roiPath: string;
}

export interface LearningResponse {
  success: boolean;
  message: string;
} 