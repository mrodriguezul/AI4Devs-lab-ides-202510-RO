"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient({
    log: ['query', 'error', 'info', 'warn'],
});
async function testConnection() {
    try {
        console.log('🔄 Testing Prisma connection...');
        // Test connection
        await prisma.$connect();
        console.log('✅ Prisma connected successfully!');
        // Test basic query
        const users = await prisma.user.findMany();
        console.log('✅ User query successful. Found:', users.length, 'users');
        // Test candidates table
        const candidates = await prisma.candidate.findMany({
            include: {
                education: true,
                workExperience: true
            }
        });
        console.log('✅ Candidates query successful. Found:', candidates.length, 'candidates');
        if (candidates.length > 0) {
            console.log('📋 Sample candidate:', {
                id: candidates[0].id,
                name: `${candidates[0].firstName} ${candidates[0].lastName}`,
                email: candidates[0].email,
                education: candidates[0].education.length,
                workExperience: candidates[0].workExperience.length
            });
        }
        return true;
    }
    catch (error) {
        console.error('❌ Prisma connection failed:', error);
        return false;
    }
    finally {
        await prisma.$disconnect();
    }
}
testConnection()
    .then((success) => {
    process.exit(success ? 0 : 1);
})
    .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
