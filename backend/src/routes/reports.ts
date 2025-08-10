import type { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma.js';

export async function reportRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/completed.csv', async (req, reply) => {
    const q = req.query as any;
    const from = q.from ? new Date(q.from) : new Date('1970-01-01');
    const to = q.to ? new Date(q.to) : new Date();
    const rows = await prisma.order.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: from, lte: to } },
      include: { client: true },
      orderBy: { createdAt: 'desc' }
    });

    const header = ['Date','Code','Client','Phone','Address','Problem','Amount','Payment'];
    const lines = [header.join(',')];
    for (const r of rows) {
      lines.push([
        r.createdAt.toISOString(),
        r.code,
        r.client.name.replace(',',' '),
        r.client.phone,
        r.address.replace(',',' '),
        r.problem.replace(',',' '),
        r.totalAmount?.toString() || '',
        r.paymentMethod || ''
      ].join(','));
    }
    reply.type('text/csv');
    return lines.join('\n');
  });
}
