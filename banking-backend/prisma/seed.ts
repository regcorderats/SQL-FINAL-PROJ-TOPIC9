import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt'; // 1. IMPORT BCRYPT VÀO ĐÂY

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('⏳ Đang khởi tạo Mock Data...');

  // 2. TẠO MỘT MẬT KHẨU MẶC ĐỊNH ĐÃ ĐƯỢC BĂM CHO TẤT CẢ USER
  const saltRounds = 10;
  const defaultPassword = await bcrypt.hash('123456', saltRounds);

  const numberOfUsers = 50;

  for (let i = 0; i < numberOfUsers; i++) {
    await prisma.user.create({
      data: {
        // Đặt tên email có quy luật một chút để bạn dễ copy đăng nhập
        email: `user${i}@aurora.bank`, 
        password: defaultPassword, // Dùng mật khẩu đã hash
        role: Role.CUSTOMER,
        
        profile: {
          create: {
            fullName: faker.person.fullName(), // Cho tên random cho xịn
            age: faker.number.int({ min: 18, max: 60 }), 
            gender: faker.helpers.arrayElement(['Male', 'Female']),
            education: "Bachelor",
            income: faker.finance.amount({ min: 1000, max: 5000, dec: 2 })
          },
        },
        
        accounts: {
          create: {
            balance: faker.finance.amount({ min: 1000, max: 50000, dec: 2 }),
          },
        },
      },
    });
  }

  console.log(`✅ Đã bơm thành công ${numberOfUsers} khách hàng!`);
  console.log(`🔑 TÀI KHOẢN TEST: user0@aurora.bank -> user49@aurora.bank`);
  console.log(`🔑 MẬT KHẨU CHUNG: 123456`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });