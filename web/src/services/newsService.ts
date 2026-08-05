import { newsData, newsCategories } from "@/data/newsData";
import { Article, NewsCategory } from "@/types/news";

export const newsService = {
  getAllArticles(): Article[] {
    return newsData;
  },

  getArticleBySlug(slug: string): Article | undefined {
    return newsData.find((a) => a.slug === slug);
  },

  getCategories(): NewsCategory[] {
    return newsCategories;
  },

  getFeaturedArticles(): Article[] {
    return newsData.filter((a) => a.isFeatured);
  }
};
