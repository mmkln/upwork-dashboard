import { useQuery } from '@tanstack/react-query';
import { fetchBlogPosts, fetchBlogPost } from '../services';
import { BlogPost } from '../../../models/blog';

export function useBlogPosts() {
  return useQuery<BlogPost[], Error>({
    queryKey: ['blogPosts'],
    queryFn: fetchBlogPosts,
  });
}

export function useBlogPost(slug: string) {
  return useQuery<BlogPost, Error>({
    queryKey: ['blogPost', slug],
    queryFn: () => fetchBlogPost(slug),
    enabled: Boolean(slug),
  });
}
