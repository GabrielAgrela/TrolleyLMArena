
import { NextResponse } from 'next/server';
import { runLLM } from '@/lib/trolleyIterator';
import { prisma } from '@/lib/prisma';
import { withRateLimit, RATE_LIMITS } from '@/lib/withRateLimit';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// GET: List all LLMs with rate limiting
export const GET = withRateLimit(async () => {
    try {
        const llms = await prisma.lLM.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        votes: {
                            where: { audioUrl: null }
                        }
                    }
                },
                provider: {
                    select: {
                        voiceId: true
                    }
                }
            }
        });

        const augmentedLLMs = llms.map(llm => ({
            ...llm,
            missingTtsCount: llm._count.votes,
            hasVoice: !!llm.provider?.voiceId
        }));

        return NextResponse.json(augmentedLLMs);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}, RATE_LIMITS.standard);

// POST: Create new LLM run (uses manual rate limiting for custom key)
export async function POST(req: Request) {
    const ip = getClientIP(req);
    const { isLimited, remaining, resetAt } = checkRateLimit(`llm-post:${ip}`, RATE_LIMITS.adminMutation);

    if (isLimited) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': resetAt.toString()
                }
            }
        );
    }

    try {
        const body = await req.json();
        const { modelId, name, reasoningEffort, providerId, createTts } = body;

        if (!modelId || !name) {
            return NextResponse.json({ error: 'Missing modelId or name' }, { status: 400 });
        }

        // Trigger run in background
        runLLM(modelId, name, reasoningEffort, providerId, createTts).catch(console.error);

        return NextResponse.json(
            { success: true, message: 'Run started' },
            { headers: { 'X-RateLimit-Remaining': remaining.toString() } }
        );
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH: Update LLM with rate limiting
export const PATCH = withRateLimit(async (req: Request) => {
    try {
        const body = await req.json();
        const { id, name, providerId } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing LLM ID' }, { status: 400 });
        }

        const updated = await prisma.lLM.update({
            where: { id },
            data: {
                name: name || undefined,
                providerId: providerId === null ? null : (providerId || undefined)
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating LLM:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}, RATE_LIMITS.adminMutation);
