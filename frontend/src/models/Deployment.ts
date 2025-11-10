export interface DeploymentResult {
  id: number;
  project_id: string;
  version: string;
  status: 'success' | 'failed' | 'in_progress';
  deployed_by: string;
  deployed_at: string;
  environment: 'production' | 'staging' | 'development';
  branch: string;
  commit_hash: string;
  description: string;
  logs: string;
  created_at: string;
  updated_at: string;
}

export interface DeploymentStats {
  project_id: string;
  total_deployments: number;
  success_count: number;
  failed_count: number;
  last_deployment: DeploymentResult | null;
}

export interface DeploymentListResponse {
  success: boolean;
  message: string;
  data: DeploymentResult[];
}

export interface DeploymentDetailResponse {
  success: boolean;
  message: string;
  data: DeploymentResult;
}

export interface DeploymentStatsResponse {
  success: boolean;
  message: string;
  data: DeploymentStats;
}
