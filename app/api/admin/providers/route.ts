import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/withRateLimit';

// GET: List all providers (standard rate limit)
export const GET = withRateLimit(async () => {
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
}, RATE_LIMITS.standard);

// POST: Create provider (admin mutation rate limit)
export const POST = withRateLimit(async (req: Request) => {
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
}, RATE_LIMITS.adminMutation);

// PATCH: Update provider (admin mutation rate limit)
export const PATCH = withRateLimit(async (req: Request) => {
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
}, RATE_LIMITS.adminMutation);
