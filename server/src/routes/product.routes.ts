import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// 1. Get Categories & Tree
router.get('/categories', async (req: Request, res: Response, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true }
    });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

// 2. Get Brands
router.get('/brands', async (req: Request, res: Response, next) => {
  try {
    const brands = await prisma.brand.findMany();
    res.json({ success: true, brands });
  } catch (error) {
    next(error);
  }
});

// 3. Search Suggestions Autocomplete
router.get('/search/suggestions', async (req: Request, res: Response, next) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.json({ success: true, suggestions: [], products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { category: { name: { contains: query } } },
          { brand: { name: { contains: query } } }
        ]
      },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        images: { where: { isPrimary: true }, take: 1, select: { url: true } }
      }
    });

    const suggestions = Array.from(new Set(products.map(p => p.title)));
    res.json({ success: true, suggestions, products });
  } catch (error) {
    next(error);
  }
});

// 4. Listing Products with Faceted Filters & Sorting
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '16'), 10);
    const skip = (page - 1) * limit;

    const categorySlug = req.query.category as string | undefined;
    const brandSlug = req.query.brand as string | undefined;
    const search = req.query.search as string | undefined;
    const minPrice = req.query.minPrice ? parseFloat(String(req.query.minPrice)) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(String(req.query.maxPrice)) : undefined;
    const minRating = req.query.minRating ? parseFloat(String(req.query.minRating)) : undefined;
    const featured = req.query.featured === 'true';
    const trending = req.query.trending === 'true';
    const sort = (req.query.sort as string) || 'relevance';

    const where: any = {
      status: 'APPROVED'
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }
    if (featured) where.isFeatured = true;
    if (trending) where.isTrending = true;

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'rating') orderBy = { rating: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          images: { orderBy: { isPrimary: 'desc' } }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// 5. Single Product Details by Slug
router.get('/:slug', async (req: Request, res: Response, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        brand: true,
        seller: {
          select: {
            id: true,
            storeName: true,
            companyName: true,
            rating: true,
            storeLogo: true
          }
        },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        specifications: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, avatar: true } }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Get related products in same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id }
      },
      take: 6,
      include: {
        images: { where: { isPrimary: true } }
      }
    });

    res.json({ success: true, product, relatedProducts });
  } catch (error) {
    next(error);
  }
});

export default router;
