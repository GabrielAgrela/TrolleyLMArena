import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();
        const { choice, reasoning } = body;

        const vote = await prisma.vote.update({
            where: { id },
            data: {
                choice,
                reasoning
            }
        });

        return NextResponse.json(vote);
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
        await prisma.vote.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
