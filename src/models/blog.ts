// src/models/blog.ts

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown or HTML
  publishedAt: string;
  tags?: string[];
}
