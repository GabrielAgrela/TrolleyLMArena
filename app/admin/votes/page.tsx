'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Vote = {
    id: string;
    choice: string;
    reasoning: string | null;
    createdAt: string;
    llm: {
        name: string;
        modelId: string;
    };
    problem: {
        title: string;
    };
};

export default function AdminVotesPage() {
    const router = useRouter();
    const [votes, setVotes] = useState<Vote[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [editingVote, setEditingVote] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ choice: '', reasoning: '' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchVotes();
    }, []);

    const fetchVotes = async () => {
        try {
            const res = await fetch('/api/admin/votes');
            if (res.ok) {
                const data = await res.json();
                setVotes(data);
            }
        } catch (error) {
            console.error('Failed to fetch votes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (vote: Vote) => {
        setEditingVote(vote.id);
        setEditForm({
            choice: vote.choice,
            reasoning: vote.reasoning || ''
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/votes/${editingVote}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                setEditingVote(null);
                fetchVotes();
                router.refresh();
            } else {
                alert('Failed to update vote');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating vote');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vote record?')) return;

        try {
            const res = await fetch(`/api/admin/votes/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchVotes();
                router.refresh();
            } else {
                alert('Failed to delete vote');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredVotes = votes.filter(vote => {
        const query = searchQuery.toLowerCase();
        return (
            vote.llm.name.toLowerCase().includes(query) ||
            vote.problem.title.toLowerCase().includes(query) ||
            vote.choice.toLowerCase().includes(query) ||
            (vote.reasoning && vote.reasoning.toLowerCase().includes(query))
        );
    });

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">Votes Audit Log</h1>
                    <p className="text-zinc-400">Review recent decisions made by models.</p>
                </div>
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search votes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                    <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </header>

            {/* Edit Modal */}
            {editingVote && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl w-full max-w-lg shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Edit Vote</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Choice</label>
                                <select
                                    value={editForm.choice}
                                    onChange={e => setEditForm({ ...editForm, choice: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                                >
                                    <option value="pull">pull</option>
                                    <option value="nothing">nothing</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Reasoning</label>
                                <textarea
                                    value={editForm.reasoning}
                                    onChange={e => setEditForm({ ...editForm, reasoning: e.target.value })}
                                    className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingVote(null)}
                                    className="px-4 py-2 text-zinc-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider bg-zinc-950/50">
                            <th className="p-4 font-medium">Time</th>
                            <th className="p-4 font-medium">Model</th>
                            <th className="p-4 font-medium">Problem</th>
                            <th className="p-4 font-medium">Choice</th>
                            <th className="p-4 font-medium w-1/3">Reasoning</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-zinc-500">Loading votes...</td></tr>
                        ) : filteredVotes.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No votes found.</td></tr>
                        ) : (
                            filteredVotes.map(vote => (
                                <tr key={vote.id} className="group hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-4 text-xs text-zinc-500 font-mono whitespace-nowrap">
                                        {new Date(vote.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-white text-sm">{vote.llm.name}</div>
                                        <div className="text-xs text-zinc-600 font-mono">{vote.llm.modelId}</div>
                                    </td>
                                    <td className="p-4 text-sm text-zinc-300">
                                        {vote.problem.title}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${vote.choice.toLowerCase() === 'pull'
                                            ? 'bg-green-900/30 text-green-400 border border-green-900/50'
                                            : 'bg-red-900/30 text-red-400 border border-red-900/50'
                                            }`}>
                                            {vote.choice}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-zinc-400">
                                        <p className="line-clamp-2 italic" title={vote.reasoning || ''}>
                                            "{vote.reasoning}"
                                        </p>
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(vote)}
                                            className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-900/20 rounded transition-all"
                                            title="Edit Vote"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vote.id)}
                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-all"
                                            title="Delete Vote"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
