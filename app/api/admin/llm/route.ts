
import { NextResponse } from 'next/server';
import { runLLM } from '@/lib/trolleyIterator';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const llms = await prisma.lLM.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(llms);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { modelId, name, reasoningEffort } = body;

        if (!modelId || !name) {
            return NextResponse.json({ error: 'Missing modelId or name' }, { status: 400 });
        }

        // Trigger run in background
        runLLM(modelId, name, reasoningEffort).catch(console.error);

        return NextResponse.json({ success: true, message: 'Run started' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
