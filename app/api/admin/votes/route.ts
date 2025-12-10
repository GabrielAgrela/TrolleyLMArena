import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const votes = await prisma.vote.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                llm: {
                    select: { name: true, modelId: true }
                },
                problem: {
                    select: { title: true }
                }
            },
            take: 200 // Limit to recent 200 votes for performance
        });

        return NextResponse.json(votes);
    } catch (e) {
        console.error(e);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
