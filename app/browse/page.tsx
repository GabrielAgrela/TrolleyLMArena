import { prisma } from '@/lib/prisma';
import TrolleyScene from '@/components/TrolleyScene';

export const dynamic = 'force-dynamic';

// Utility to get a random problem or a specific one
async function getProblem(id?: string) {
    if (id) {
        const problem = await prisma.problem.findUnique({
            where: { id },
            include: {
                votes: {
                    include: {
                        llm: {
                            include: {
                                provider: true
                            }
                        }
                    }
                }
            }
        });
        if (problem) return problem;
    }

    // Fallback to random
    const ids = await prisma.problem.findMany({ select: { id: true } });
    if (ids.length === 0) return null;
    const randomId = ids[Math.floor(Math.random() * ids.length)].id;

    return await prisma.problem.findUnique({
        where: { id: randomId },
        include: {
            votes: {
                include: {
                    llm: {
                        include: {
                            provider: true
                        }
                    }
                }
            }
        }
    });
}

export default async function BrowsePage(props: { searchParams: Promise<{ problemId?: string }> }) {
    const searchParams = await props.searchParams;
    const problem = await getProblem(searchParams.problemId);

    // Fetch list of all problems for the selector
    const allProblems = await prisma.problem.findMany({
        select: { id: true, title: true },
        orderBy: { title: 'asc' }
    });

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
        <TrolleyScene key={problem.id} problem={problem as any} votes={problem.votes} allProblems={allProblems} />
    );
}
