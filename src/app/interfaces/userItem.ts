export interface UserItem {
  id: number;
  code: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  email: string;
  phone_number: string;
}

export interface UsersApiResponse {
  items: UserItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  links: {
    first: string;
    last?: string;
    next?: string;
    prev?: string;
  };
}