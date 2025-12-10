
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
        const { modelId, name, reasoningEffort, providerId } = body;

        if (!modelId || !name) {
            return NextResponse.json({ error: 'Missing modelId or name' }, { status: 400 });
        }

        // Trigger run in background
        runLLM(modelId, name, reasoningEffort, providerId).catch(console.error);

        return NextResponse.json({ success: true, message: 'Run started' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
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
                providerId: providerId === null ? null : (providerId || undefined) // Handle explicit null to disconnect, or update
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating LLM:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
