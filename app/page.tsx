import { prisma } from '@/lib/prisma';
import LeaderboardClient from '@/components/LeaderboardClient';

// Force dynamic rendering to avoid DB connection during build
export const dynamic = 'force-dynamic';
// Revalidate leaderboard every 60 seconds (ISR)
export const revalidate = 60;

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
