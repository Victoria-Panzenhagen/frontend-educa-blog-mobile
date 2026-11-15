
import { api } from './api';
import { ApiPost, PaginatedResponse } from '@/types/api';
import { Post } from '@/types/post';

function mapPost(post: ApiPost): Post {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    discipline: post.discipline.name,
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
