
import { api } from './api';

export interface Discipline {
  id: number;
  name: string;
}

export async function getDisciplines(
  name?: string,
): Promise<Discipline[]> {
  const response = await api.get<Discipline[]>('/discipline', {
    params: name ? { name } : {},
  });

  return response.data;
}
