export interface UserView {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  code: string;
  is_active: boolean;
  roles: string[]; // ex: ['admin']
}