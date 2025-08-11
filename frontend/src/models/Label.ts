export interface LabelData {
  roi_id: string;
  has_vehicle: boolean;
}

export interface ImageLabel {
  image_id: string;
  image_url: string;
  labels: LabelData[];
}

export interface LabelResponse {
  success: boolean;
  message: string;
  data?: ImageLabel[];
}

export interface SaveLabelRequest {
  projectId: string;
  folderPath: string;
  imageLabels: ImageLabel[];
}
