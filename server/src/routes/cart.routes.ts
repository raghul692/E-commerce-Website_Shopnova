import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// Get User Cart
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: {
            images: { orderBy: { isPrimary: 'desc' }, take: 1 },
            seller: { select: { storeName: true } }
          }
        },
        variant: true
      }
    });

    const subtotal = items.reduce((acc, item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      return acc + price * item.quantity;
    }, 0);

    const estimatedTax = Math.round(subtotal * 0.18);
    const estimatedShipping = subtotal > 1000 ? 0 : 99;
    const total = subtotal + estimatedTax + estimatedShipping;

    res.json({
      success: true,
      items,
      summary: {
        itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
        subtotal,
        estimatedTax,
        estimatedShipping,
        total
      }
    });
  } catch (error) {
    next(error);
  }
});

// Add Item to Cart
const addToCartSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  selectedAttributes: z.string().optional()
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { productId, variantId, quantity, selectedAttributes } = addToCartSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check stock
    const availableStock = variantId
      ? product.variants.find(v => v.id === variantId)?.stock || 0
      : product.stockCount;

    if (availableStock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${availableStock} units available in stock.` });
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: req.user!.id,
        productId,
        variantId: variantId || null
      }
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
      return res.json({ success: true, message: 'Cart updated.', item: updated });
    }

    const item = await prisma.cartItem.create({
      data: {
        userId: req.user!.id,
        productId,
        variantId: variantId || null,
        quantity,
        selectedAttributes
      }
    });

    res.status(201).json({ success: true, message: 'Item added to cart.', item });
  } catch (error) {
    next(error);
  }
});

// Update Quantity
router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { quantity } = z.object({ quantity: z.number().int().nonnegative() }).parse(req.body);

    if (quantity === 0) {
      await prisma.cartItem.deleteMany({
        where: { id: req.params.id, userId: req.user!.id }
      });
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    const updated = await prisma.cartItem.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { quantity }
    });

    res.json({ success: true, message: 'Cart quantity updated.' });
  } catch (error) {
    next(error);
  }
});

// Delete Single Item
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { id: req.params.id, userId: req.user!.id }
    });
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
});

// Clear Cart
router.delete('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.id } });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
});

export default router;
