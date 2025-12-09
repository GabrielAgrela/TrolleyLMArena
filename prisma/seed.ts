import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const problemsPath = path.join(process.cwd(), 'data', 'problems.json');
    const statsPath = path.join(process.cwd(), 'data', 'ProblemStats.json');

    const problemsData = JSON.parse(fs.readFileSync(problemsPath, 'utf-8'));
    const statsData = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));

    console.log(`Seeding ${problemsData.length} problems...`);

    for (const problem of problemsData) {
        const stat = statsData[problem.id];

        // Default to 0 votes if not found in stats
        const humanPullVotes = stat ? stat.pull : 0;
        const humanNothingVotes = stat ? stat.nothing : 0;

        await prisma.problem.upsert({
            where: { id: problem.id },
            update: {
                title: problem.title,
                text: problem.text,
                option1: problem.option1 || {},
                option2: problem.option2 || {},
                humanPullVotes,
                humanNothingVotes,
            },
            create: {
                id: problem.id,
                title: problem.title,
                text: problem.text,
                option1: problem.option1 || {},
                option2: problem.option2 || {},
                humanPullVotes,
                humanNothingVotes,
            },
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
