import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogPost } from '../features/blog/hooks/useBlogPosts';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug!);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{post!.title}</h1>
      <pre className="bg-gray-100 p-4 rounded mb-4">{post!.content}</pre>
      <Link to="/upwork-dashboard/blog" className="text-blue-600 hover:underline">
        ← Back to Blog List
      </Link>
    </div>
  );
};

export default BlogPostPage;
