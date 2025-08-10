import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { prisma } from './utils/prisma.js';
import { authRoutes } from './routes/auth.js';
import { orderRoutes } from './routes/orders.js';
import { clientRoutes } from './routes/clients.js';
import { uploadRoutes } from './routes/uploads.js';
import { reportRoutes } from './routes/reports.js';
import { userRoutes } from './routes/users.js';

const PORT = parseInt(process.env.PORT || '4000', 10);
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

const app = Fastify({
  logger: true
});

await app.register(cors, { origin: true, credentials: true });
await app.register(jwt, { secret: process.env.JWT_SECRET || 'devsecret' });
await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });

await app.register(swagger, {
  openapi: {
    info: { title: 'Appliance CRM API', version: '0.1.0' },
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  }
});
await app.register(swaggerUI, { routePrefix: '/docs' });

app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try { await request.jwtVerify(); } catch (e) { return reply.status(401).send({ message: 'Unauthorized' }); }
});
app.decorate('rbac', (roles: string[]) => async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user as any;
  if (!user || !roles.includes(user.role)) {
    return reply.status(403).send({ message: 'Forbidden' });
  }
});

// Health
app.get('/health', async () => ({ ok: true }));

// Routes
app.register(authRoutes, { prefix: '/auth' });
app.register(userRoutes, { prefix: '/users' });
app.register(clientRoutes, { prefix: '/clients' });
app.register(orderRoutes, { prefix: '/orders' });
app.register(uploadRoutes, { prefix: '/attachments', uploadDir: UPLOAD_DIR });
app.register(reportRoutes, { prefix: '/reports' });

// Start
app.listen({ port: PORT, host: '0.0.0.0' }).then(() => {
  app.log.info(`API on :${PORT}`);
});
