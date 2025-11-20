import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'password123';

  console.log('Creating admin user...');
  console.log('Email:', email);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Admin',
    },
  });

  console.log('Admin user created successfully!');
  console.log('Email:', user.email);
  console.log('You can now log in at /admin/login');
}

main()
  .catch((error) => {
    console.error('Error creating admin user:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
