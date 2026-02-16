export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pages: number;
}
