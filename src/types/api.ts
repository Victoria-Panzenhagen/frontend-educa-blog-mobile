export interface ApiPost {
  id: number;
  title: string;
  content: string;
  discipline: {
    id: number;
    name: string;
  };
  createdAt: string;
  autor: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
}