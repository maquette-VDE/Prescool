export interface Project {
  id: number;
  name: string;
  status: string;
  is_active: boolean;
}


export interface ProjectResponse {
  items: Project[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  links: {
    [key: string]: any; // Pour gérer le "additionalProp1" du Swagger
  };
}
