import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

// 1. Admin Dashboard KPIs & System Analytics
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const [totalUsers, totalSellers, totalProducts, totalOrders, ordersAgg] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.sellerProfile.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        _avg: { totalAmount: true }
      })
    ]);

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });

    res.json({
      success: true,
      kpis: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue: ordersAgg._sum.totalAmount || 0,
        averageOrderValue: Math.round(ordersAgg._avg.totalAmount || 0)
      },
      recentOrders
    });
  } catch (error) {
    next(error);
  }
});

// 2. User Management
router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body; // ACTIVE, SUSPENDED
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ success: true, message: `User status updated to ${status}`, user });
  } catch (error) {
    next(error);
  }
});

// 3. Seller Approvals
router.get('/sellers', async (req, res, next) => {
  try {
    const sellers = await prisma.sellerProfile.findMany({
      include: { user: { select: { name: true, email: true } } }
    });
    res.json({ success: true, sellers });
  } catch (error) {
    next(error);
  }
});

router.patch('/sellers/:id/approve', async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const seller = await prisma.sellerProfile.update({
      where: { id: req.params.id },
      data: { isApproved }
    });
    res.json({ success: true, message: `Seller approval set to ${isApproved}`, seller });
  } catch (error) {
    next(error);
  }
});

// 4. Audit Logs
router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
});

export default router;
