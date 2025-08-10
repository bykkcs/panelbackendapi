import { prisma } from './utils/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  const users = [
    { name: 'Admin', phone: '+10000000001', role: 'ADMIN', password: 'admin123' },
    { name: 'Call Center', phone: '+10000000002', role: 'CALL_CENTER', password: 'call123' },
    { name: 'Master Mike', phone: '+10000000003', role: 'MASTER', password: 'master123' },
    { name: 'Accounting', phone: '+10000000004', role: 'ACCOUNTING', password: 'acc123' }
  ] as const;

  for (const u of users) {
    await prisma.user.upsert({
      where: { phone: u.phone },
      update: {},
      create: { name: u.name, phone: u.phone, role: u.role as any, passwordHash: await bcrypt.hash(u.password, 10) }
    });
  }

  // Sample client + order
  const c = await prisma.client.upsert({
    where: { phone: '+79990000000' },
    update: {},
    create: {
      name: 'Иван Петров',
      phone: '+79990000000',
      address: 'Москва, ул. Пушкина, д. 1',
      metro: 'Пушкинская',
      howToGet: 'Подъезд 2, домофон 123'
    }
  });

  const o = await prisma.order.create({
    data: {
      code: 'ORD-20250101-1234',
      clientId: c.id,
      applianceType: 'Холодильник',
      applianceAge: '5 лет',
      problem: 'Шумит и не морозит',
      address: c.address,
      metro: c.metro,
      howToGet: c.howToGet,
      scheduledAt: new Date()
    }
  });

  console.log('Seed done with sample order:', o.code);
}

main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
