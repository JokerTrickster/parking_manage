export interface HistoryItem {
  id: number;
  name: string;
  created_at: string;
  folder_path: string;
  cctv_list: string[];
}

export interface HistoryResponse {
  results: HistoryItem[];
}
