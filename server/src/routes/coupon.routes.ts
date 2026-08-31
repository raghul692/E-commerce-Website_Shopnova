import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.get('/active', async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validUntil: { gte: new Date() }
      },
      select: {
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minOrderValue: true,
        maxDiscountAmount: true,
        validUntil: true
      }
    });
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
});

router.post('/validate', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { code, cartSubtotal } = req.body;
    if (!code || cartSubtotal === undefined) {
      return res.status(400).json({ success: false, message: 'Coupon code and cart subtotal are required.' });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: String(code).toUpperCase() } });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    }

    if (new Date() > new Date(coupon.validUntil)) {
      return res.status(400).json({ success: false, message: 'This coupon code has expired.' });
    }

    if (cartSubtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required to apply this coupon.`
      });
    }

    // Check user usage limit
    const userUsageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId: req.user!.id }
    });

    if (userUsageCount >= coupon.perUserLimit) {
      return res.status(400).json({ success: false, message: 'You have already reached the maximum usage limit for this coupon.' });
    }

    // Calculate discount amount server-side
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (cartSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, cartSubtotal);

    res.json({
      success: true,
      message: 'Coupon applied successfully!',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
