
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        console.log('Sample duplicate:', duplicates[0]);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
