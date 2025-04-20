import React from 'react';
import { useBlogPosts } from '../features/blog/hooks/useBlogPosts';
import { Link } from 'react-router-dom';

const BlogListPage: React.FC = () => {
  const { data: posts, isLoading, error } = useBlogPosts();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Blog Posts</h1>
      <ul className="list-disc pl-5">
        {posts?.map((post) => (
          <li key={post.slug}>
            <Link to={`/upwork-dashboard/blog/${post.slug}`} className="text-blue-600 hover:underline">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogListPage;
