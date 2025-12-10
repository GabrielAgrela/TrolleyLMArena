import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) {
        redirect('/auth/signin');
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <h1 className="text-xl font-bold tracking-tight">
                        Trolley <span className="text-purple-400">Admin</span>
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="block px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        📊 Evaluations
                    </Link>
                    <Link
                        href="/admin/companies"
                        className="block px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        🏢 Model Companies
                    </Link>
                    <Link
                        href="/admin/problems"
                        className="block px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        🚋 Problems
                    </Link>
                    <Link
                        href="/admin/votes"
                        className="block px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        🗳️ Votes
                    </Link>
                    <Link
                        href="/admin/voices"
                        className="block px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        🗣️ Voices
                    </Link>
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <Link href="/leaderboard" className="block px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors">
                        &larr; Back to Public Site
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-8 md:p-12 max-w-6xl mx-auto">
                    {children}
                </div>
            </div>
        </main>
    );
}
