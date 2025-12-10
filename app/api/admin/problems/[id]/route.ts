import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();
        const { title, text, humanPullVotes, humanNothingVotes } = body;

        const problem = await prisma.problem.update({
            where: { id },
            data: {
                title,
                text,
                humanPullVotes: humanPullVotes !== undefined ? parseInt(humanPullVotes) : undefined,
                humanNothingVotes: humanNothingVotes !== undefined ? parseInt(humanNothingVotes) : undefined,
            }
        });

        return NextResponse.json(problem);
    } catch (e) {
        console.error(e);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await params;

    try {
        await prisma.problem.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
