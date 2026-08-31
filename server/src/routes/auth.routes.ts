import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'shopnova_super_secret_jwt_key_2026_production_grade';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['CUSTOMER', 'SELLER']).default('CUSTOMER'),
  companyName: z.string().optional(),
  storeName: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: validated.email } });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        passwordHash,
        name: validated.name,
        role: validated.role,
        wallet: {
          create: {
            balance: 500.0,
            currency: 'INR'
          }
        },
        sellerProfile: validated.role === 'SELLER' ? {
          create: {
            companyName: validated.companyName || `${validated.name} Enterprises`,
            storeName: validated.storeName || `${validated.name} Store`,
            isApproved: true
          }
        } : undefined
      },
      include: { sellerProfile: true }
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sellerProfileId: user.sellerProfile?.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sellerProfileId: user.sellerProfile?.id
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { sellerProfile: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by administration.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as any,
        sellerProfileId: user.sellerProfile?.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        sellerProfileId: user.sellerProfile?.id
      }
    });
  } catch (error) {
    next(error);
  }
});

// Me Profile
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        sellerProfile: true,
        addresses: true,
        wallet: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    next(error);
  }
});

export default router;
