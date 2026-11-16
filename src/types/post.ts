
export interface Post {
  id: number;
  title: string;
  content: string;
  discipline: string;
  disciplineId: number;
  author: string;
  createdAt: string;
}

export interface PostInput {
  title: string;
  content: string;
  disciplineId: number;
}