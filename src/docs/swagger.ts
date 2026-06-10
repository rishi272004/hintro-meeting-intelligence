import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Hintro Meeting Intelligence API',
    version: '1.0.0',
    description: 'AI-powered meeting intelligence service with transcript analysis, action item tracking, and automated reminders.',
  },
  servers: [{ url: '/api', description: 'API base path' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and get JWT token',
      },
    },
    '/meetings': {
      post: {
        tags: ['Meetings'],
        summary: 'Create a meeting with transcript',
        security: [{ bearerAuth: [] }],
      },
      get: {
        tags: ['Meetings'],
        summary: 'List meetings with pagination',
        security: [{ bearerAuth: [] }],
      },
    },
    '/meetings/{id}': {
      get: {
        tags: ['Meetings'],
        summary: 'Get a meeting by ID',
        security: [{ bearerAuth: [] }],
      },
    },
    '/meetings/{id}/analyze': {
      post: {
        tags: ['AI Analysis'],
        summary: 'Run AI analysis on a meeting transcript',
        security: [{ bearerAuth: [] }],
      },
    },
    '/action-items': {
      post: {
        tags: ['Action Items'],
        summary: 'Create a new action item',
        security: [{ bearerAuth: [] }],
      },
      get: {
        tags: ['Action Items'],
        summary: 'List action items with filters',
        security: [{ bearerAuth: [] }],
      },
    },
    '/action-items/{id}/status': {
      patch: {
        tags: ['Action Items'],
        summary: 'Update action item status',
        security: [{ bearerAuth: [] }],
      },
    },
    '/action-items/overdue': {
      get: {
        tags: ['Action Items'],
        summary: 'Get overdue action items',
        security: [{ bearerAuth: [] }],
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'Hintro API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
}
