
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rateLimit';

// DELETE: Delete LLM with rate limiting
export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    // Apply rate limiting
    const ip = getClientIP(req);
    const { isLimited, remaining, resetAt } = checkRateLimit(`delete-llm:${ip}`, RATE_LIMITS.adminMutation);

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

    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    try {
        await prisma.lLM.delete({
            where: { id },
        });
        return NextResponse.json(
            { success: true },
            { headers: { 'X-RateLimit-Remaining': remaining.toString() } }
        );
    } catch (error) {
        console.error('Delete failed:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
