
import { api } from './api';
import { ApiPost, PaginatedResponse } from '@/types/api';
import { Post, PostInput } from '@/types/post';

function mapPost(post: ApiPost): Post {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    discipline: post.discipline.name,
    disciplineId: post.discipline.id,
    author: post.autor,
    createdAt: post.createdAt,
  };
}

export async function getPosts(
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<Post>> {
  const response = await api.get<PaginatedResponse<ApiPost>>(
    '/posts',
    {
      params: { page, limit },
    },
  );

  return {
    ...response.data,
    data: response.data.data.map(mapPost),
  };
}

export async function getPostById(id: number): Promise<Post> {
  const response = await api.get<ApiPost>(`/posts/${id}`);

  return mapPost(response.data);
}

export async function getMyPosts(
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<Post>> {
  const response = await api.get<PaginatedResponse<ApiPost>>(
    '/posts/me',
    {
      params: { page, limit },
    },
  );

  return {
    ...response.data,
    data: response.data.data.map(mapPost),
  };
}

export async function createPost(data: PostInput): Promise<void> {
  await api.post('/posts', data);
}

export async function updatePost(
  id: number,
  data: PostInput,
): Promise<void> {
  await api.put(`/posts/${id}`, data);
}

export async function deletePost(id: number): Promise<void> {
  await api.delete(`/posts/${id}`);
}


export async function searchPosts(
  search: string,
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<Post>> {
  const response = await api.get<PaginatedResponse<ApiPost>>(
    '/posts/search',
    {
      params: {
        search,
        page,
        limit,
      },
    },
  );

  return {
    ...response.data,
    data: response.data.data.map(mapPost),
  };
}
