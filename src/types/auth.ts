export type UserRole = 'ALUNO' | 'PROFESSOR';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}


export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
