import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

// Load environment variables (.env or .env.local/.env.docker)
dotenv.config();

const prisma = new PrismaClient();

async function seed() {
  console.log('🔁 Starting candidate seeder...');

  const candidates = [];
  for (let i = 0; i < 10; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email(firstName, lastName).toLowerCase();
    const phone = faker.phone.number();
    const address = `${faker.address.streetAddress()}, ${faker.address.city()}, ${faker.address.country()}`;

    const educationCount = faker.datatype.number({ min: 0, max: 3 });
    const workCount = faker.datatype.number({ min: 0, max: 3 });

    const education = Array.from({ length: educationCount }).map(() => ({
      degree: faker.name.jobType() + ' Degree',
      institution: faker.company.name(),
      graduationYear: faker.datatype.number({ min: 1995, max: 2025 }),
    }));

    const workExperience = Array.from({ length: workCount }).map(() => ({
      company: faker.company.name(),
      position: faker.name.jobTitle(),
      startDate: faker.date.past(10).toISOString(),
      endDate: null,
      description: faker.lorem.sentence(),
    }));

    candidates.push({ firstName, lastName, email, phone, address, education, workExperience });
  }

  for (const c of candidates) {
    try {
      await prisma.candidate.upsert({
        where: { email: c.email },
        update: {},
        create: {
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone,
          address: c.address,
          education: {
            create: c.education,
          },
          workExperience: {
            create: c.workExperience.map((w: any) => ({
              company: w.company,
              position: w.position,
              startDate: new Date(w.startDate),
              endDate: null,
              description: w.description,
            })),
          },
        },
      });
      console.log(`✅ Upserted candidate ${c.email}`);
    } catch (error) {
      console.error('❌ Failed to upsert candidate', c.email, error);
    }
  }

  console.log('🎉 Seeding complete.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
