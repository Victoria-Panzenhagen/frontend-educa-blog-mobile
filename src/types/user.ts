import { PaginatedResponse } from '@/types/api';

export type UserRole = 'ALUNO' | 'PROFESSOR';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
}

export type PaginatedUsers = PaginatedResponse<User>;
