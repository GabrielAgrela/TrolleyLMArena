
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const problems = await prisma.problem.findMany();
    console.log(JSON.stringify(problems, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
