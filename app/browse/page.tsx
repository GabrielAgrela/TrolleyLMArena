import { prisma } from '@/lib/prisma';
import TrolleyScene from '@/components/TrolleyScene';

export const dynamic = 'force-dynamic';

async function getRandomProblem() {
    const ids = await prisma.problem.findMany({
        select: { id: true }
    });

    if (ids.length === 0) return null;

    const randomId = ids[Math.floor(Math.random() * ids.length)].id;

    return await prisma.problem.findUnique({
        where: { id: randomId },
        include: {
            votes: {
                include: {
                    llm: true
                }
            }
        }
    });
}

export default async function BrowsePage() {
    const problem = await getRandomProblem();

    if (!problem) {
        return (
            <div className="min-h-screen bg-black text-zinc-400 flex items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">No problems found</h1>
                    <p>Run some evaluations first to populate the database.</p>
                </div>
            </div>
        );
    }

    return (
        <TrolleyScene problem={problem} votes={problem.votes} />
    );
}
