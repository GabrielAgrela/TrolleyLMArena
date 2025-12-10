import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const session = await auth();
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const providers = await prisma.provider.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { llms: true } } }
        });
        return NextResponse.json(providers);
    } catch (error) {
        console.error('Error fetching providers:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, logoUrl } = body;

        if (!name || !logoUrl) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const provider = await prisma.provider.create({
            data: {
                name,
                logoUrl,
                voiceId: body.voiceId || undefined
            }
        });

        return NextResponse.json(provider);
    } catch (error) {
        console.error('Error creating provider:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await auth();
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, name, logoUrl } = body;

        if (!id) {
            return new NextResponse('Missing provider ID', { status: 400 });
        }

        const provider = await prisma.provider.update({
            where: { id },
            data: {
                name: name || undefined,
                logoUrl: logoUrl || undefined,
                voiceId: body.voiceId || undefined
            }
        });

        return NextResponse.json(provider);
    } catch (error) {
        console.error('Error updating provider:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
