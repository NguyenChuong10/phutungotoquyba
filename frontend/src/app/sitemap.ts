import { MetadataRoute } from 'next';
import { API_BASE_URL } from '@/config/api';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  // Base Public Pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/quotation`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Dynamically fetch News Articles for Sitemap
  try {
    const res = await fetch(`${API_BASE_URL}/news?limit=200`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const articles = Array.isArray(data.data) ? data.data : (data.articles || []);
      if (Array.isArray(articles)) {
        articles.forEach((article: any) => {
          if (article.slug) {
            routes.push({
              url: `${baseUrl}/news/${article.slug}`,
              lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
              changeFrequency: 'weekly',
              priority: 0.8,
            });
          }
        });
      }
    }
  } catch (err) {
    console.error('Sitemap news fetch error:', err);
  }

  // Dynamically fetch Products for Sitemap
  try {
    const res = await fetch(`${API_BASE_URL}/products?limit=1000`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const products = Array.isArray(data.data) ? data.data : (data.products || []);
      if (Array.isArray(products)) {
        products.forEach((prod: any) => {
          if (prod.id) {
            routes.push({
              url: `${baseUrl}/products/${prod.id}`,
              lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
              changeFrequency: 'weekly',
              priority: 0.8,
            });
          }
        });
      }
    }
  } catch (err) {
    console.error('Sitemap products fetch error:', err);
  }

  return routes;
}
