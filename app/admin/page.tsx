
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminControls from '@/components/AdminControls';
import DeleteLLMButton from '@/components/DeleteLLMButton';
import LLMStatusList from '@/components/LLMStatusList';
import Link from 'next/link';

export default async function AdminPage() {
    const session = await auth();
    if (!session) {
        redirect('/auth/signin');
    }

    const llms = await prisma.lLM.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <main className="min-h-screen p-8 md:p-24 bg-zinc-950 text-white">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                        <p className="text-zinc-400">Manage LLMs and Evaluations</p>
                    </div>
                    <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">
                        &larr; Back to Leaderboard
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-1">
                        <AdminControls />
                    </div>

                    {/* Right Column: Status List */}
                    <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
                        <h2 className="text-2xl font-bold mb-6">Recent Evaluations</h2>
                        <LLMStatusList initialLLMs={llms} />
                    </div>
                </div>
            </div>
        </main>
    );
}
