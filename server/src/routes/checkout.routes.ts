import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

const placeOrderSchema = z.object({
  addressId: z.string(),
  paymentMethod: z.enum(['CARD', 'UPI', 'NETBANKING', 'WALLET', 'COD', 'RAZORPAY', 'STRIPE']),
  couponCode: z.string().optional()
});

router.post('/place-order', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { addressId, paymentMethod, couponCode } = placeOrderSchema.parse(req.body);
    const userId = req.user!.id;

    // 1. Fetch User Cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
        variant: true
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    // 2. Fetch Delivery Address
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Delivery address not found.' });
    }

    // 3. Server-side Recalculation (Price Security)
    let subtotal = 0;
    let totalTax = 0;

    for (const item of cartItems) {
      const price = item.variant ? item.variant.price : item.product.price;
      const availableStock = item.variant ? item.variant.stock : item.product.stockCount;

      if (availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insufficient for "${item.product.title}". Only ${availableStock} units remaining.`
        });
      }

      subtotal += price * item.quantity;
      totalTax += (price * item.quantity * item.product.taxRate) / 100;
    }

    const shippingCharge = subtotal > 1000 ? 0 : 99;
    let discountAmount = 0;

    // 4. Validate Coupon if present
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive && new Date() <= new Date(coupon.validUntil) && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, subtotal);
      }
    }

    const finalTotal = Math.round(subtotal + totalTax + shippingCharge - discountAmount);

    // 5. Execute Atomic Database Transaction
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = `SN-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const order = await prisma.$transaction(async (tx) => {
      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal: Math.round(subtotal),
          taxAmount: Math.round(totalTax),
          shippingAmount: shippingCharge,
          discountAmount: Math.round(discountAmount),
          totalAmount: finalTotal,
          couponCode: couponCode ? couponCode.toUpperCase() : null,
          status: 'CONFIRMED',
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
          paymentMethod,
          deliveryTrackingNumber: trackingNumber,
          estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          shippingAddressJson: JSON.stringify(address),
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              title: item.product.title + (item.variant ? ` (${item.variant.title})` : ''),
              price: item.variant ? item.variant.price : item.product.price,
              quantity: item.quantity,
              taxAmount: Math.round(((item.variant ? item.variant.price : item.product.price) * item.quantity * item.product.taxRate) / 100),
              totalAmount: Math.round((item.variant ? item.variant.price : item.product.price) * item.quantity)
            }))
          },
          shipmentTracking: {
            create: {
              carrier: 'SHOPNOVA Priority Express',
              trackingNumber,
              status: 'CONFIRMED',
              currentCity: 'Merchant Sorting Hub',
              timelineJson: JSON.stringify([
                { status: 'CONFIRMED', location: 'SHOPNOVA Order Engine', timestamp: new Date().toISOString(), note: 'Order placed & verified' }
              ])
            }
          },
          payments: {
            create: {
              userId,
              paymentGateway: paymentMethod,
              transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
              amount: finalTotal,
              currency: 'INR',
              status: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESS'
            }
          }
        }
      });

      // Update Inventory Stock
      for (const item of cartItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stockCount: { decrement: item.quantity } }
        });
      }

      // Clear User Cart
      await tx.cartItem.deleteMany({ where: { userId } });

      return createdOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount
    });
  } catch (error) {
    next(error);
  }
});

export default router;
