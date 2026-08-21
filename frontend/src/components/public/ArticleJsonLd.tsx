import React from "react";
import Script from "next/script";

interface ArticleJsonLdProps {
  article: {
    title: string;
    description: string;
    slug: string;
    imageSrc: string;
    publishedAt: string;
    author?: string;
    category?: string;
  };
  siteUrl?: string;
}

export default function ArticleJsonLd({ article, siteUrl = "https://phutungotoquyba.com" }: ArticleJsonLdProps) {
  const fullUrl = `${siteUrl}/news/${article.slug}`;
  const imageUrl = article.imageSrc.startsWith("http")
    ? article.imageSrc
    : `${siteUrl}${article.imageSrc.startsWith("/") ? "" : "/"}${article.imageSrc}`;

  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${fullUrl}#article`,
        "isPartOf": {
          "@type": "WebPage",
          "@id": fullUrl,
          "url": fullUrl,
          "name": article.title,
        },
        "headline": article.title,
        "description": article.description,
        "image": [imageUrl],
        "datePublished": article.publishedAt,
        "dateModified": article.publishedAt,
        "mainEntityOfPage": fullUrl,
        "author": {
          "@type": "Organization",
          "name": article.author || "Công ty TNHH Cơ Khí Ô Tô Q.BA Đà Nẵng",
          "url": siteUrl,
        },
        "publisher": {
          "@type": "Organization",
          "name": "Phụ Tùng Ô Tô Q.BA",
          "url": siteUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/images/brand/logo.png`,
          },
        },
        "articleSection": article.category || "Cẩm Nang Kỹ Thuật",
        "inLanguage": "vi-VN",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${fullUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Trang Chủ",
            "item": siteUrl,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tin Tức & Cẩm Nang",
            "item": `${siteUrl}/news`,
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": article.title,
            "item": fullUrl,
          },
        ],
      },
    ],
  };

  return (
    <Script
      id={`article-jsonld-${article.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
