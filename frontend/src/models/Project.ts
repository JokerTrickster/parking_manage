export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  status?: 'active' | 'inactive';
}

export interface ProjectStats {
  learning_images_count: number;
  test_images_count: number;
  matched_count: number;
} 