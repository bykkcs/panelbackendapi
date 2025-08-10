import type { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma.js';
import fs from 'fs';
import path from 'path';

export async function uploadRoutes(app: FastifyInstance, opts: any) {
  const uploadDir = (opts as any).uploadDir as string;
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  app.addHook('preHandler', app.authenticate);

  app.post('/', async (req, reply) => {
    const parts = req.parts();
    let orderId: string | null = null;
    const uploads: any[] = [];

    for await (const part of parts) {
      if (part.type === 'file') {
        const filename = `${Date.now()}-${part.filename}`;
        const filepath = path.join(uploadDir, filename);
        await new Promise<void>((resolve, reject) => {
          const ws = fs.createWriteStream(filepath);
          part.file.pipe(ws);
          ws.on('finish', () => resolve());
          ws.on('error', reject);
        });
        uploads.push({ filename: part.filename, stored: filename, mime: part.mimetype, path: filepath });
      } else if (part.type === 'field' && part.fieldname === 'orderId') {
        orderId = part.value as string;
      }
    }

    if (!orderId) return reply.status(400).send({ message: 'orderId required' });

    const created = await Promise.all(uploads.map(u => prisma.attachment.create({
      data: {
        orderId: orderId!,
        filename: u.filename,
        mimeType: u.mime,
        path: u.stored,
        uploadedById: (req.user as any).sub
      }
    })));

    await prisma.auditLog.create({ data: { userId: (req.user as any).sub, action: 'upload', entity: 'order', entityId: orderId! } });
    return created;
  });

  app.get('/:id/download', async (req, reply) => {
    const id = (req.params as any).id as string;
    const att = await prisma.attachment.findUnique({ where: { id } });
    if (!att) return reply.status(404).send({ message: 'Not found' });
    const real = path.join((opts as any).uploadDir as string, att.path);
    if (!fs.existsSync(real)) return reply.status(404).send({ message: 'File gone' });
    reply.header('Content-Disposition', `attachment; filename="${att.filename}"`);
    return reply.send(fs.createReadStream(real));
  });
}
