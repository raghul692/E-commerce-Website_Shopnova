import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['SELLER', 'ADMIN', 'SUPER_ADMIN']));

// Seller Dashboard KPIs
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const sellerId = req.user!.sellerProfileId;
    if (!sellerId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Seller profile required.' });
    }

    const whereSeller = sellerId ? { sellerId } : {};

    const [productsCount, totalProducts] = await Promise.all([
      prisma.product.count({ where: whereSeller }),
      prisma.product.findMany({ where: whereSeller, include: { orderItems: true } })
    ]);

    const totalSalesUnits = totalProducts.reduce((sum, p) => sum + p.orderItems.reduce((acc, i) => acc + i.quantity, 0), 0);
    const totalRevenue = totalProducts.reduce((sum, p) => sum + p.orderItems.reduce((acc, i) => acc + i.totalAmount, 0), 0);

    const lowStockCount = await prisma.product.count({
      where: { ...whereSeller, stockCount: { lte: 10 } }
    });

    res.json({
      success: true,
      kpis: {
        totalProducts: productsCount,
        totalSalesUnits,
        totalRevenue,
        lowStockCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// Seller Products List
router.get('/products', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const sellerId = req.user!.sellerProfileId;
    const products = await prisma.product.findMany({
      where: sellerId ? { sellerId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true
      }
    });
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
});

// Create Product Multi-Step Form endpoint
const createProductSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  categoryId: z.string(),
  brandId: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive(),
  stockCount: z.number().int().nonnegative(),
  images: z.array(z.string().url()).min(1),
  specifications: z.array(z.object({ specKey: z.string(), specValue: z.string() })).optional()
});

router.post('/products', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const data = createProductSchema.parse(req.body);
    let sellerId = req.user!.sellerProfileId;

    if (!sellerId) {
      const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId: req.user!.id } });
      if (sellerProfile) sellerId = sellerProfile.id;
    }

    if (!sellerId) {
      return res.status(400).json({ success: false, message: 'Active seller profile required to list products.' });
    }

    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
    const sku = `SKU-SEL-${Math.floor(100000 + Math.random() * 900000)}`;

    const discountPercentage = Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100);

    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug,
        sku,
        description: data.description,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        sellerId,
        price: data.price,
        originalPrice: data.originalPrice,
        discountPercentage: Math.max(0, discountPercentage),
        stockCount: data.stockCount,
        status: 'APPROVED',
        images: {
          create: data.images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            sortOrder: idx
          }))
        },
        specifications: data.specifications ? {
          create: data.specifications.map(s => ({
            specKey: s.specKey,
            specValue: s.specValue
          }))
        } : undefined
      },
      include: { images: true }
    });

    res.status(201).json({ success: true, message: 'Product created successfully.', product });
  } catch (error) {
    next(error);
  }
});

// Update Inventory Stock
router.patch('/inventory/:productId', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { stockCount } = z.object({ stockCount: z.number().int().nonnegative() }).parse(req.body);

    const product = await prisma.product.update({
      where: { id: req.params.productId },
      data: { stockCount }
    });

    res.json({ success: true, message: 'Inventory updated.', stockCount: product.stockCount });
  } catch (error) {
    next(error);
  }
});

export default router;
