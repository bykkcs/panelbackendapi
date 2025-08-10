import type { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma.js';

export async function userRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate, app.rbac(['ADMIN'])] }, async () => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map(u => ({ id: u.id, name: u.name, phone: u.phone, role: u.role }));
  });
}
