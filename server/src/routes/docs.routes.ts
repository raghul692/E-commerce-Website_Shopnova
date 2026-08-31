import { Router } from 'express';

const router = Router();

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SHOPNOVA API Documentation',
    version: '1.0.0',
    description: 'Production-grade RESTful API endpoints for SHOPNOVA E-Commerce Platform.'
  },
  servers: [{ url: 'http://localhost:5000/api', description: 'Local Development Server' }],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Authenticate User',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'customer@example.com' },
                  password: { type: 'string', example: 'Password123!' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'JWT Authentication Token' } }
      }
    },
    '/products': {
      get: {
        summary: 'Faceted Product Search & Filter',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'brand', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'sort', in: 'query', schema: { type: 'string', example: 'price_asc' } }
        ],
        responses: { 200: { description: 'Paginated product array' } }
      }
    },
    '/checkout/place-order': {
      post: {
        summary: 'Atomic Checkout & Order Creation',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Order created with tracking number' } }
      }
    }
  }
};

router.get('/', (req, res) => {
  res.json(openApiSpec);
});

export default router;
