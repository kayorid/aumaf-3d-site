"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const seedPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
    if (!process.env.SEED_ADMIN_PASSWORD) {
        console.warn('⚠️  SEED_ADMIN_PASSWORD não definida — usando senha padrão insegura. Não use em produção.');
    }
    const hashedPassword = await bcrypt_1.default.hash(seedPassword, 12);
    await prisma.user.upsert({
        where: { email: 'admin@aumaf3d.com.br' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@aumaf3d.com.br',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });
    await prisma.setting.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            siteName: 'AUMAF 3D',
            siteDescription: 'Impressão 3D profissional — FDM, SLA, SLS, SLM e mais.',
        },
    });
    console.log('✅ Seed concluído.');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
