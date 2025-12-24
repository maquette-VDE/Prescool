export interface UserApi {
  id: number;
  code: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export interface UserApiResponse {
  items: UserApi[];
}