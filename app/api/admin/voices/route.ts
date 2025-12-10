
import { NextResponse } from 'next/server';
import { getVoices } from '@/lib/elevenlabs';

export async function GET() {
    try {
        const voices = await getVoices();
        return NextResponse.json(voices);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch voices' }, { status: 500 });
    }
}
