
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { updateLLMStats } from '../lib/trolleyIterator';

async function main() {
    console.log('Fetching all LLMs...');
    const llms = await prisma.lLM.findMany();
    console.log(`Found ${llms.length} LLMs.`);

    for (const llm of llms) {
        console.log(`Updating stats for ${llm.name} (${llm.modelId})...`);
        try {
            await updateLLMStats(llm.id);
            console.log(`Updated.`);
        } catch (error) {
            console.error(`Failed to update ${llm.name}:`, error);
        }
    }

    console.log('Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
