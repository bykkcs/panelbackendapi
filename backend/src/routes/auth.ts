import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import bcrypt from 'bcryptjs';

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', {
    schema: {
      summary: 'Login',
      body: {
        type: 'object',
        properties: { phone: { type: 'string' }, password: { type: 'string' } },
        required: ['phone', 'password']
      }
    }
  }, async (req, reply) => {
    const schema = z.object({ phone: z.string().min(3), password: z.string().min(3) });
    const { phone, password } = schema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return reply.status(401).send({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return reply.status(401).send({ message: 'Invalid credentials' });
    const token = (app as any).jwt.sign({ sub: user.id, role: user.role, name: user.name, phone: user.phone });
    await prisma.auditLog.create({ data: { userId: user.id, action: 'login', entity: 'user', entityId: user.id } });
    return { token, user: { id: user.id, name: user.name, role: user.role, phone: user.phone } };
  });

  app.get('/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return { user: user && { id: user.id, name: user.name, role: user.role, phone: user.phone } };
  });
}
