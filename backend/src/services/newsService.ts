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
    isPublicOnly?: boolean;
  }) {
    const page = params?.page ? Math.max(1, params.page) : 1;
    const limit = params?.limit ? Math.max(1, params.limit) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.isPublicOnly) {
      where.isPublished = true;
      where.publishedAt = { lte: new Date() };
    }

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
   * Public Get News Detail by Slug or ID (Increments Views Counter)
   */
  static async getNewsBySlug(slugOrId: string, isPublicOnly: boolean = false) {
    const cleanParam = slugOrId.trim();
    const isNumeric = /^\d+$/.test(cleanParam);

    const where: any = isNumeric
      ? { OR: [{ id: parseInt(cleanParam, 10) }, { slug: cleanParam }] }
      : { slug: cleanParam };

    if (isPublicOnly) {
      where.isPublished = true;
      where.publishedAt = { lte: new Date() };
    }

    const article = await prisma.news.findFirst({
      where,
      include: {
        author: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (
      !article ||
      (isPublicOnly &&
        (article.isPublished === false ||
          (article.publishedAt && new Date(article.publishedAt) > new Date())))
    ) {
      throw new AppError("Bài viết kỹ thuật này hiện chưa đến giờ xuất bản", 404);
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
    slug?: string;
    categorySlug?: string;
    tags?: string[];
    content: string;
    thumbnailUrl?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
    publishedAt?: Date | string;
    authorId?: number;
  }) {
    if (!data.title || data.title.trim() === "") {
      throw new AppError("Tiêu đề bài viết không được để trống", 400);
    }
    if (!data.content || data.content.trim() === "") {
      throw new AppError("Nội dung bài viết không được để trống", 400);
    }

    let finalSlug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!finalSlug) finalSlug = `post-${Date.now()}`;

    const slugCheck = await prisma.news.findUnique({ where: { slug: finalSlug } });
    if (slugCheck) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    let validAuthorId: number | null = null;
    if (data.authorId) {
      const user = await prisma.user.findUnique({ where: { id: data.authorId } });
      if (user) {
        validAuthorId = data.authorId;
      }
    }

    const newArticle = await prisma.news.create({
      data: {
        title: data.title.trim(),
        slug: finalSlug,
        categorySlug: data.categorySlug || "cam-nang-ky-thuat",
        tags: Array.isArray(data.tags) ? data.tags.map((t) => t.trim()).filter(Boolean) : [],
        content: data.content.trim(),
        thumbnailUrl: data.thumbnailUrl || "/images/logo/logonen.png",
        isFeatured: data.isFeatured ?? false,
        isPublished: data.isPublished ?? true,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        authorId: validAuthorId,
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
      slug?: string;
      categorySlug?: string;
      tags?: string[];
      content?: string;
      thumbnailUrl?: string;
      isFeatured?: boolean;
      isPublished?: boolean;
      publishedAt?: Date | string;
    }
  ) {
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy bài viết để cập nhật", 404);
    }

    let slug = existing.slug;
    const requestedSlug = data.slug ? slugify(data.slug) : data.title ? slugify(data.title) : undefined;

    if (requestedSlug && requestedSlug !== existing.slug) {
      const slugConflict = await prisma.news.findFirst({
        where: { slug: requestedSlug, NOT: { id } },
      });
      if (slugConflict) {
        slug = `${requestedSlug}-${Date.now().toString().slice(-4)}`;
      } else {
        slug = requestedSlug;
      }
    }

    const updated = await prisma.news.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        slug,
        categorySlug: data.categorySlug !== undefined ? data.categorySlug : undefined,
        tags: Array.isArray(data.tags) ? data.tags.map((t) => t.trim()).filter(Boolean) : undefined,
        content: data.content !== undefined ? data.content.trim() : undefined,
        thumbnailUrl: data.thumbnailUrl !== undefined ? data.thumbnailUrl : undefined,
        isFeatured: data.isFeatured !== undefined ? data.isFeatured : undefined,
        isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
        publishedAt: data.publishedAt !== undefined ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : undefined,
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
