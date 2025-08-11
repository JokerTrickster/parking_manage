export interface LabelData {
  roi_id: string;
  has_vehicle: boolean;
}

export interface GetLabelResponse {
  success: boolean;
  message: string;
  data?: LabelData[];
}

export interface SaveLabelRequest {
  labels: LabelData[];
}

export interface SaveLabelResponse {
  labels: LabelData[];
}
