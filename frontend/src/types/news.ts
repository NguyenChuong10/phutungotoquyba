export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  imageSrc: string;
  isFeatured?: boolean;
  tags: string[];
}

export type NewsCategory = string;
