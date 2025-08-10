import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { Prisma } from '@prisma/client';

export async function clientRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (req, reply) => {
    const q = (req.query as any)?.q as string | undefined;
    const where = q ? {
      OR: [
        { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { phone: { contains: q } }
      ]
    } : {};
    const clients = await prisma.client.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
    return clients;
  });

  app.post('/', async (req, reply) => {
    const schema = z.object({
      name: z.string().min(1),
      phone: z.string().min(3),
      address: z.string().min(1),
      metro: z.string().optional(),
      howToGet: z.string().optional()
    });
    const data = schema.parse(req.body);
    const created = await prisma.client.create({ data });
    await prisma.auditLog.create({ data: { userId: (req.user as any).sub, action: 'create', entity: 'client', entityId: created.id } });
    return created;
  });
}
