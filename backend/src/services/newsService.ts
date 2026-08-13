import prisma from "../config/db";
import { AppError } from "../utils/AppError";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export class NewsService {
  /**
   * Public & Admin Get News List
   */
  static async getNewsList(params?: {
    categorySlug?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params?.page ? Math.max(1, params.page) : 1;
    const limit = params?.limit ? Math.max(1, params.limit) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.categorySlug && params.categorySlug !== "all") {
      where.categorySlug = params.categorySlug;
    }

    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, news] = await Promise.all([
      prisma.news.count({ where }),
      prisma.news.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
    ]);

    return {
      news,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Public Get News Detail by Slug (Increments Views Counter)
   */
  static async getNewsBySlug(slug: string) {
    const cleanSlug = slug.trim();
    const article = await prisma.news.findUnique({
      where: { slug: cleanSlug },
      include: {
        author: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!article) {
      throw new AppError("Không tìm thấy bài viết kỹ thuật yêu cầu", 404);
    }

    // Increment views count asynchronously
    await prisma.news.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    return {
      ...article,
      views: article.views + 1,
    };
  }

  /**
   * Admin Create News Article
   */
  static async createNews(data: {
    title: string;
    categorySlug?: string;
    content: string;
    thumbnailUrl?: string;
    isFeatured?: boolean;
    authorId?: number;
  }) {
    if (!data.title || data.title.trim() === "") {
      throw new AppError("Tiêu đề bài viết không được để trống", 400);
    }
    if (!data.content || data.content.trim() === "") {
      throw new AppError("Nội dung bài viết không được để trống", 400);
    }

    const baseSlug = slugify(data.title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newArticle = await prisma.news.create({
      data: {
        title: data.title.trim(),
        slug: uniqueSlug,
        categorySlug: data.categorySlug || "cam-nang-ky-thuat",
        content: data.content.trim(),
        thumbnailUrl: data.thumbnailUrl || "/images/news-section/news-1.png",
        isFeatured: data.isFeatured ?? false,
        authorId: data.authorId || null,
      },
    });

    return newArticle;
  }

  /**
   * Admin Update News Article
   */
  static async updateNews(
    id: number,
    data: {
      title?: string;
      categorySlug?: string;
      content?: string;
      thumbnailUrl?: string;
      isFeatured?: boolean;
    }
  ) {
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy bài viết để cập nhật", 404);
    }

    let slug = existing.slug;
    if (data.title && data.title.trim() !== existing.title) {
      slug = `${slugify(data.title)}-${Date.now().toString().slice(-4)}`;
    }

    const updated = await prisma.news.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        slug,
        categorySlug: data.categorySlug !== undefined ? data.categorySlug : undefined,
        content: data.content !== undefined ? data.content.trim() : undefined,
        thumbnailUrl: data.thumbnailUrl !== undefined ? data.thumbnailUrl : undefined,
        isFeatured: data.isFeatured !== undefined ? data.isFeatured : undefined,
      },
    });

    return updated;
  }

  /**
   * Admin Delete News Article
   */
  static async deleteNews(id: number) {
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy bài viết để xóa", 404);
    }

    await prisma.news.delete({ where: { id } });
    return { success: true, message: `Đã xóa bài viết "${existing.title}" thành công` };
  }
}
