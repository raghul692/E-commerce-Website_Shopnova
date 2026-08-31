import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 }
          }
        }
      }
    });
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'ProductId is required.' });
    }

    const existing = await prisma.wishlistItem.findFirst({
      where: { userId: req.user!.id, productId }
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return res.json({ success: true, isWishlisted: false, message: 'Removed from wishlist.' });
    }

    const item = await prisma.wishlistItem.create({
      data: { userId: req.user!.id, productId }
    });

    res.status(201).json({ success: true, isWishlisted: true, message: 'Added to wishlist.', item });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { id: req.params.id, userId: req.user!.id }
    });
    res.json({ success: true, message: 'Wishlist item removed.' });
  } catch (error) {
    next(error);
  }
});

export default router;
