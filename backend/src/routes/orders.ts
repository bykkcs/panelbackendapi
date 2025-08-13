import type { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

function genCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  const rand = Math.floor(Math.random()*9000)+1000;
  return `ORD-${y}${m}${d}-${rand}`;
}

export async function orderRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (req, reply) => {
    const user = req.user as any;
    const q = req.query as any;
    const status = q.status as string | undefined;
    const search = q.search as string | undefined;

    let where: any = {};
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { address: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { client: { is: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } } },
        { client: { is: { phone: { contains: search } } } }
      ];
    }

    if (user.role === 'MASTER') where.assignedToId = user.sub;
    if (user.role === 'ACCOUNTING') where.status = 'COMPLETED';

    const orders = await prisma.order.findMany({
      where,
      include: { client: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
      take: 200
    });
    return orders;
  });

  app.get('/:id', async (req, reply) => {
    const id = (req.params as any).id as string;
    const ord = await prisma.order.findUnique({
      where: { id },
      include: { client: true, assignedTo: true, attachments: true, workLogs: true, payments: true }
    });
    if (!ord) return reply.status(404).send({ message: 'Not found' });
    return ord;
  });

  app.post('/', { preHandler: [app.rbac(['ADMIN','CALL_CENTER'])] }, async (req, reply) => {
    const schema = z.object({
      client: z.object({
        name: z.string().min(1),
        phone: z.string().min(3),
        address: z.string().min(1),
        metro: z.string().optional(),
        howToGet: z.string().optional()
      }),
      applianceType: z.string().min(1),
      applianceAge: z.string().optional(),
      problem: z.string().min(1),
      scheduledAt: z.preprocess((val) => {
        if (typeof val !== 'string') return val;
        const d = new Date(val);
        return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
      }, z.string().datetime()).optional()
    });
    const data = schema.parse(req.body);

    const client = await prisma.client.upsert({
      where: { phone: data.client.phone },
      create: data.client,
      update: {
        name: data.client.name,
        address: data.client.address,
        metro: data.client.metro,
        howToGet: data.client.howToGet
      }
    });

    const order = await prisma.order.create({
      data: {
        code: genCode(),
        clientId: client.id,
        applianceType: data.applianceType,
        applianceAge: data.applianceAge,
        problem: data.problem,
        address: client.address,
        metro: client.metro,
        howToGet: client.howToGet,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null
      },
      include: { client: true }
    });

    await prisma.auditLog.create({ data: { userId: (req.user as any).sub, action: 'create', entity: 'order', entityId: order.id } });
    return order;
  });

  app.post('/:id/assign', { preHandler: [app.rbac(['ADMIN','CALL_CENTER'])] }, async (req, reply) => {
    const id = (req.params as any).id as string;
    const schema = z.object({ masterId: z.string().min(1) });
    const { masterId } = schema.parse(req.body);
    const exists = await prisma.user.findFirst({ where: { id: masterId, role: 'MASTER' } });
    if (!exists) return reply.status(400).send({ message: 'Master not found' });

    const order = await prisma.order.update({
      where: { id },
      data: { assignedToId: masterId, status: 'ASSIGNED' },
      include: { client: true, assignedTo: true }
    });
    await prisma.workLog.create({ data: { orderId: id, masterId, action: 'assigned' } });
    await prisma.auditLog.create({ data: { userId: (req.user as any).sub, action: 'assign', entity: 'order', entityId: id } });
    return order;
  });

  app.post('/:id/start', { preHandler: [app.rbac(['MASTER'])] }, async (req, reply) => {
    const id = (req.params as any).id as string;
    const uid = (req.user as any).sub;
    const order = await prisma.order.update({ where: { id }, data: { status: 'IN_PROGRESS' } });
    await prisma.workLog.create({ data: { orderId: id, masterId: uid, action: 'start' } });
    return order;
  });

  app.post('/:id/complete', { preHandler: [app.rbac(['MASTER'])] }, async (req, reply) => {
    const id = (req.params as any).id as string;
    const schema = z.object({ amount: z.number().nonnegative(), paymentMethod: z.enum(['CASH','CARD','TRANSFER']), comments: z.string().optional() });
    const { amount, paymentMethod, comments } = schema.parse(req.body);
    const uid = (req.user as any).sub;

    const order = await prisma.order.update({
      where: { id },
      data: { status: 'COMPLETED', totalAmount: amount, paymentMethod, comments }
    });
    await prisma.payment.create({ data: { orderId: id, amount, method: paymentMethod } });
    await prisma.workLog.create({ data: { orderId: id, masterId: uid, action: 'complete', comment: comments || null } });
    await prisma.auditLog.create({ data: { userId: uid, action: 'complete', entity: 'order', entityId: id } });
    return order;
  });

  app.get('/masters/list', { preHandler: [app.rbac(['ADMIN','CALL_CENTER'])] }, async () => {
    const masters = await prisma.user.findMany({ where: { role: 'MASTER' }, orderBy: { name: 'asc' } });
    return masters.map(m => ({ id: m.id, name: m.name, phone: m.phone }));
  });
}
