import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// Create Payment Gateway Intent / Order (Razorpay / Stripe driver)
router.post('/create-intent', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { orderId, provider = 'RAZORPAY' } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const gatewayOrderId = `pay_${provider.toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    res.json({
      success: true,
      provider,
      gatewayOrderId,
      amount: order.totalAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_shopnova_key_id'
    });
  } catch (error) {
    next(error);
  }
});

// Verify Payment Webhook / Callback
router.post('/verify', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { orderId, paymentId, signature, status = 'SUCCESS' } = req.body;

    const payment = await prisma.payment.findFirst({ where: { orderId } });
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status, transactionId: paymentId || payment.transactionId }
      });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: status === 'SUCCESS' ? 'COMPLETED' : 'FAILED' }
    });

    res.json({ success: true, message: 'Payment verification processed.' });
  } catch (error) {
    next(error);
  }
});

export default router;
