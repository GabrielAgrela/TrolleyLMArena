
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runSingleProblem, updateLLMStats } from '@/lib/trolleyIterator';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15+ (current config implies 15 or 14 but treating as promise is safer or check usage)
) {
    // In Next.js 15, params is a promise.
    const { id } = await params;

    try {
        // 1. Fetch problem
        const problem = await prisma.problem.findUnique({
            where: { id }
        });

        if (!problem) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        }

        // 2. Fetch all active LLMs
        // We probably want running or completed ones.
        const llms = await prisma.lLM.findMany({
            where: {
                status: { in: ['RUNNING', 'COMPLETED'] }
            }
        });

        let triggeredCount = 0;

        // 3. Check for missing votes and run
        for (const llm of llms) {
            const existingVote = await prisma.vote.findFirst({
                where: {
                    llmId: llm.id,
                    problemId: id
                }
            });

            if (!existingVote) {
                // Run in background? Or wait? 
                // Since this might take a while for many LLMs, we should probably just trigger them background-style 
                // BUT if we want to ensure they run, we might want to await. 
                // OpenRouter has rate limits. Sequential is safer.
                // However, request might timeout if too many.
                // Recommending: run async (fire and forget per LLM) or use a proper queue.
                // Given the scale, I'll fire and forget the individual run function but catch errors.
                // Actually, runSingleProblem catches its own errors.
                // Let's await to avoid flooding openrouter if there are 50 missing.
                // AND we need to update stats.

                await runSingleProblem(llm, problem);

                // Update stats for this LLM since we added a vote
                await updateLLMStats(llm.id);

                triggeredCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `triggered ${triggeredCount} runs`,
            count: triggeredCount
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Run Missing Error:', error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
