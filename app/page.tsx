import { prisma } from '@/lib/prisma';
import LeaderboardClient from '@/components/LeaderboardClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const llms = await prisma.lLM.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { alignmentScore: 'desc' },
        include: {
            votes: {
                include: {
                    problem: true
                }
            },
            provider: true
        }
    });

    return <LeaderboardClient llms={llms} />;
}
