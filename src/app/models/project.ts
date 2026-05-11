export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
}


export interface ProjectResponse {
  items: Project[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  links: {
    [key: string]: any;
  };
  ownerFullname?: string;
}
