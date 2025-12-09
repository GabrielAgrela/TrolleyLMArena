
import { NextResponse } from 'next/server';
import { runLLM } from '@/lib/trolleyIterator';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { modelId, name, reasoningEffort } = body;

        if (!modelId || !name) {
            return NextResponse.json({ error: 'Missing modelId or name' }, { status: 400 });
        }

        // Trigger run in background (fire and forget for this request, or await?)
        // Vercel serverless might kill background tasks if we return early.
        // Ideally we use a queue, but for "simple website", we can maybe await it or accept risk.
        // Or we use `waitUntil` if on Vercel Edge/Serverless.

        // For local docker, we can just run it. The request might time out if it takes too long.
        // Iterating 28 problems * ~2-5s per problem = ~2 mins.
        // We should probably NOT await it fully if we want to return fast.

        // Let's run it non-awaiting and hope the runtime keeps it alive (Node runtime usually does unless shut down).
        runLLM(modelId, name).catch(console.error);

        return NextResponse.json({ success: true, message: 'Run started' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
