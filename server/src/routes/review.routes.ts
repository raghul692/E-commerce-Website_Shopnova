import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(2),
  comment: z.string().min(5)
});

// Post a review
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { productId, rating, title, comment } = createReviewSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if user bought product
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: 'DELIVERED' }
      }
    });

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title,
        comment,
        isVerifiedPurchase: Boolean(orderItem),
        status: 'APPROVED'
      }
    });

    // Recalculate Product average rating
    const aggregate = await prisma.review.aggregate({
      where: { productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round((aggregate._avg.rating || 5) * 10) / 10,
        reviewCount: aggregate._count.rating || 0
      }
    });

    res.status(201).json({ success: true, message: 'Review published.', review });
  } catch (error) {
    next(error);
  }
});

// Vote review as helpful
router.post('/:id/helpful', authenticateToken, async (req, res, next) => {
  try {
    await prisma.review.update({
      where: { id: req.params.id },
      data: { helpfulCount: { increment: 1 } }
    });
    res.json({ success: true, message: 'Vote recorded.' });
  } catch (error) {
    next(error);
  }
});

export default router;
