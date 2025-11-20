const { PrismaClient } = require('@prisma/client');

async function testPrisma() {
  const prisma = new PrismaClient();
  
  try {
    // Test the connection
    await prisma.$connect();
    console.log('✅ Prisma connected successfully!');
    
    // Test a simple query
    const users = await prisma.user.findMany();
    console.log('✅ Query successful. Users found:', users.length);
    
    // Test candidates table
    const candidates = await prisma.candidate.findMany();
    console.log('✅ Candidates query successful. Candidates found:', candidates.length);
    
  } catch (error) {
    console.error('❌ Prisma connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();