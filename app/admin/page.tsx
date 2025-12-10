
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
        include: { provider: true } // Include provider details for display
    });

    const providers = await prisma.provider.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Evaluations</h1>
                <p className="text-zinc-400">Manage LLM runs and view status.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-1">
                    <AdminControls providers={providers} />
                </div>

                {/* Right Column: Status List */}
                <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
                    <h2 className="text-2xl font-bold mb-6">Recent Evaluations</h2>
                    <LLMStatusList initialLLMs={llms} providers={providers} />
                </div>
            </div>
        </div>
    );
}
