import apiClient from '../../api';
import { BlogPost } from '../../models/blog';

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const response = await apiClient.get<BlogPost[]>('/blog/posts');
  return response.data;
}

export async function fetchBlogPost(slug: string): Promise<BlogPost> {
  const response = await apiClient.get<BlogPost>(`/blog/posts/${slug}`);
  return response.data;
}
