import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Vietnamese pure slugify helper
function toSlug(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const getBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({
      ok: true,
      data: brands,
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: { message: error.message || 'Lỗi server khi lấy danh sách thương hiệu' } });
  }
};

export const createBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, logoUrl } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ ok: false, error: { message: 'Tên thương hiệu không được để trống' } });
      return;
    }

    const slug = toSlug(name) || `brand-${Date.now()}`;

    const newBrand = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug,
        logoUrl: logoUrl || '/images/logo/logonen.png',
      },
    });

    res.status(201).json({
      ok: true,
      message: 'Tạo thương hiệu thành công',
      data: newBrand,
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: { message: error.message || 'Không thể tạo thương hiệu' } });
  }
};

export const updateBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, logoUrl } = req.body;

    const brandId = parseInt(id, 10);
    if (isNaN(brandId)) {
      res.status(400).json({ ok: false, error: { message: 'ID thương hiệu không hợp lệ' } });
      return;
    }

    const updateData: any = {};
    if (name) {
      updateData.name = name.trim();
      updateData.slug = toSlug(name) || `brand-${brandId}`;
    }
    if (logoUrl !== undefined) {
      updateData.logoUrl = logoUrl;
    }

    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: updateData,
    });

    res.json({
      ok: true,
      message: 'Cập nhật thương hiệu thành công',
      data: updatedBrand,
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: { message: error.message || 'Không thể cập nhật thương hiệu' } });
  }
};

export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const brandId = parseInt(id, 10);

    if (isNaN(brandId)) {
      res.status(400).json({ ok: false, error: { message: 'ID thương hiệu không hợp lệ' } });
      return;
    }

    await prisma.brand.delete({
      where: { id: brandId },
    });

    res.json({
      ok: true,
      message: 'Xóa thương hiệu thành công',
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: { message: error.message || 'Không thể xóa thương hiệu' } });
  }
};
