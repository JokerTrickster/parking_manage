export interface CctvImageConfig {
  type: string;
  displayName: string;
  description: string;
  endpoint: string;
}

export interface CctvConfig {
  cctvId: string;
  displayName: string;
  description: string;
  images: CctvImageConfig[];
}

export interface CctvTemplate {
  projectId: string;
  projectName: string;
  cctvList: CctvConfig[];
}
