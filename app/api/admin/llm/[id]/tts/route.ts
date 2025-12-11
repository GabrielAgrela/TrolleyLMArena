
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTTS } from '@/lib/elevenlabs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const llmId = params.id;

        // Fetch LLM and provider voice
        const llm = await prisma.lLM.findUnique({
            where: { id: llmId },
            include: { provider: true }
        });

        if (!llm) {
            return NextResponse.json({ error: 'LLM not found' }, { status: 404 });
        }

        if (!llm.provider?.voiceId) {
            return NextResponse.json({ error: 'Provider has no voice ID configured' }, { status: 400 });
        }

        // Find votes with missing audio
        const votes = await prisma.vote.findMany({
            where: {
                llmId: llmId,
                audioUrl: null
            }
        });

        console.log(`Found ${votes.length} votes missing audio for LLM ${llmId}`);

        // Process in parallel (or batches)
        let converted = 0;
        const errors = [];

        for (const vote of votes) {
            try {
                // Generate TTS
                const reasoning = vote.reasoning || "No reasoning provided";
                const textToSpeak = reasoning.length > 4000 ? reasoning.slice(0, 4000) + '...' : reasoning;

                const audioUrl = await generateTTS(textToSpeak, llm.provider.voiceId);

                if (audioUrl) {
                    await prisma.vote.update({
                        where: { id: vote.id },
                        data: { audioUrl }
                    });
                    converted++;
                }
            } catch (err: any) {
                console.error(`Failed to generate TTS for vote ${vote.id}:`, err);
                errors.push(err.message);
            }
        }

        return NextResponse.json({
            success: true,
            converted,
            total: votes.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error generating missing TTS:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
