import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const problems = await prisma.problem.findMany({
        orderBy: { title: 'asc' },
        include: {
            votes: true
        }
    });

    return NextResponse.json(problems);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const body = await req.json();
        const { id, title, text, humanPullVotes, humanNothingVotes } = body;

        const problem = await prisma.problem.create({
            data: {
                id, // Allow manual ID setting if provided? Or generate? Schema says @id not @default(uuid).
                // Actually schema says: id String @id. It does NOT say default(uuid).
                // So we must provide it. If the user doesn't, we should generate one.
                title,
                text,
                option1: {}, // Default empty json
                option2: {}, // Default empty json
                humanPullVotes: parseInt(humanPullVotes) || 0,
                humanNothingVotes: parseInt(humanNothingVotes) || 0,
            }
        });

        return NextResponse.json(problem);
    } catch (e) {
        console.error(e);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
