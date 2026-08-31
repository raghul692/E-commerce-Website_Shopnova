import { Request } from 'express';

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';
  sellerProfileId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}
