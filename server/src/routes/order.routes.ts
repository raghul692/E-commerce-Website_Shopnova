import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// Get User Orders List
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } }
            }
          }
        },
        shipmentTracking: true
      }
    });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

// Single Order Detail
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } }
            }
          }
        },
        payments: true,
        shipmentTracking: true,
        refunds: true
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// Cancel Order
router.post('/:id/cancel', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order in state: ${order.status}` });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' }
    });

    res.json({ success: true, message: 'Order cancelled successfully.', order: updated });
  } catch (error) {
    next(error);
  }
});

// Request Return
router.post('/:id/return', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { reason } = req.body;
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });

    if (!order || order.status !== 'DELIVERED') {
      return res.status(400).json({ success: false, message: 'Returns can only be requested for delivered orders.' });
    }

    const refund = await prisma.refund.create({
      data: {
        orderId: order.id,
        userId: req.user!.id,
        amount: order.totalAmount,
        reason: reason || 'Customer Return Request',
        status: 'REQUESTED'
      }
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'RETURN_REQUESTED' }
    });

    res.status(201).json({ success: true, message: 'Return request submitted.', refund });
  } catch (error) {
    next(error);
  }
});

// Download HTML/Text Invoice Payload
router.get('/:id/invoice', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        items: true,
        user: { select: { name: true, email: true, phone: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const address = JSON.parse(order.shippingAddressJson || '{}');

    const invoiceData = {
      invoiceNumber: `INV-${order.orderNumber}`,
      date: order.createdAt.toISOString().split('T')[0],
      customer: {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone,
        address: `${address.streetAddress}, ${address.city}, ${address.state} - ${address.postalCode}`
      },
      seller: {
        name: 'SHOPNOVA Retail Private Limited',
        gstin: '29AAACS1234F1Z5',
        address: '108 Industrial Hub, Electronic City, Bengaluru 560100'
      },
      items: order.items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        tax: item.taxAmount,
        total: item.totalAmount
      })),
      financials: {
        subtotal: order.subtotal,
        tax: order.taxAmount,
        shipping: order.shippingAmount,
        discount: order.discountAmount,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus
      }
    };

    res.json({ success: true, invoice: invoiceData });
  } catch (error) {
    next(error);
  }
});

export default router;
