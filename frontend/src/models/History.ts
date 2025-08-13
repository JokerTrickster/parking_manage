export interface HistoryItem {
  id: number;
  name: string;
  created_at: string;
  folder_path: string;
  cctv_list?: string[];
  var_threshold: number;
  learning_rate: number;
  epoch: number;
}

export interface HistoryResponse {
  results: HistoryItem[];
}
