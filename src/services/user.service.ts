import { api } from '@/services/api';
import { PaginatedResponse } from '@/types/api';
import { CreateUserInput, UpdateUserInput, User } from '@/types/user';

export async function getUsers(
  page = 1,
  limit = 5,
  search = '',
): Promise<PaginatedResponse<User>> {
  const response = await api.get<PaginatedResponse<User>>('/users', {
    params: { page, limit, ...(search.trim() ? { search: search.trim() } : {}) },
  });

  return response.data;
}

export async function getUserById(id: number): Promise<User> {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
}

export async function createUser(data: CreateUserInput): Promise<void> {
  await api.post('/users', data);
}

export async function updateUser(
  id: number,
  data: UpdateUserInput,
): Promise<void> {
  await api.put(`/users/${id}`, data);
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}

/** Fetches every page matching the API search so client-side role filtering is complete. */
export async function getAllUsers(search = ''): Promise<User[]> {
  const limit = 100;
  const firstPage = await getUsers(1, limit, search);
  const users = [...firstPage.data];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const response = await getUsers(page, limit, search);
    users.push(...response.data);
  }

  return users;
}
