
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const votes = await prisma.vote.findMany();
    console.log(`Total votes: ${votes.length}`);

    const seen = new Set();
    const duplicates = [];

    for (const vote of votes) {
        const key = `${vote.llmId}-${vote.problemId}`;
        if (seen.has(key)) {
            duplicates.push(vote);
        } else {
            seen.add(key);
        }
    }

    console.log(`Duplicate votes found: ${duplicates.length}`);

    if (duplicates.length > 0) {
        console.log('Deleting duplicates...');
        for (const dup of duplicates) {
            await prisma.vote.delete({ where: { id: dup.id } });
            console.log(`Deleted vote ${dup.id} (duplicate for ${dup.llmId} on ${dup.problemId})`);
        }
        console.log('Finished deleting duplicates.');
    } else {
        console.log('No duplicates to delete.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
