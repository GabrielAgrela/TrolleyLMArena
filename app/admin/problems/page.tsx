'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

type Problem = {
    id: string;
    title: string;
    text: string;
    humanPullVotes: number;
    humanNothingVotes: number;
    votes: any[];
};

export default function AdminProblemsPage() {
    const router = useRouter();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isRunningMissing, setIsRunningMissing] = useState<Record<string, boolean>>({});

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        text: '',
        humanPullVotes: 0,
        humanNothingVotes: 0
    });

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const res = await fetch('/api/admin/problems');
            if (res.ok) {
                const data = await res.json();
                setProblems(data);
            }
        } catch (error) {
            console.error('Failed to fetch problems:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (problem: Problem) => {
        setFormData({
            id: problem.id,
            title: problem.title,
            text: problem.text,
            humanPullVotes: problem.humanPullVotes,
            humanNothingVotes: problem.humanNothingVotes
        });
        setIsEditing(problem.id);
        setIsAdding(false);
    };

    const handleAddNew = () => {
        setFormData({
            id: uuidv4(),
            title: '',
            text: '',
            humanPullVotes: 0,
            humanNothingVotes: 0
        });
        setIsAdding(true);
        setIsEditing(null);
    };

    const handleCancel = () => {
        setIsEditing(null);
        setIsAdding(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let res;
            if (isAdding) {
                res = await fetch('/api/admin/problems', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else if (isEditing) {
                res = await fetch(`/api/admin/problems/${isEditing}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            if (res?.ok) {
                await fetchProblems();
                handleCancel();
                router.refresh();
            } else {
                alert('Failed to save problem');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving problem');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this problem?')) return;

        try {
            const res = await fetch(`/api/admin/problems/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchProblems();
            } else {
                alert('Failed to delete problem');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRunMissing = async (id: string) => {
        setIsRunningMissing(prev => ({ ...prev, [id]: true }));
        try {
            const res = await fetch(`/api/admin/problems/${id}/run-missing`, {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                await fetchProblems(); // refresh vote counts
            } else {
                alert('Failed to trigger runs: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error triggering runs');
        } finally {
            setIsRunningMissing(prev => ({ ...prev, [id]: false }));
        }
    };

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const hasRunning = Object.values(isRunningMissing).some(Boolean);
        if (!hasRunning) return;

        const interval = setInterval(() => {
            fetchProblems();
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunningMissing]);

    const filteredProblems = problems.filter(problem => {
        const query = searchQuery.toLowerCase();
        return (
            problem.title.toLowerCase().includes(query) ||
            problem.text.toLowerCase().includes(query) ||
            problem.id.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">Trolley Problems</h1>
                    <p className="text-zinc-400">Manage the scenarios LLMs are tested against.</p>
                </div>
                {!isAdding && !isEditing && (
                    <div className="flex gap-4">
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search problems..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                            />
                            <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                        >
                            + Add Problem
                        </button>
                    </div>
                )}
            </header>

            {/* Form Section */}
            {(isAdding || isEditing) && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">{isAdding ? 'New Problem' : 'Edit Problem'}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">ID (UUID)</label>
                                <input
                                    type="text"
                                    value={formData.id}
                                    onChange={e => setFormData({ ...formData, id: e.target.value })}
                                    disabled={!isAdding} // ID editable only on creation? Usually better to lock it or auto-gen. I'll allow edit on creation if needed, but it's pre-filled.
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Description Text</label>
                                <textarea
                                    value={formData.text}
                                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-32"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Human Pull Votes</label>
                                <input
                                    type="number"
                                    value={formData.humanPullVotes}
                                    onChange={e => setFormData({ ...formData, humanPullVotes: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Human Nothing Votes</label>
                                <input
                                    type="number"
                                    value={formData.humanNothingVotes}
                                    onChange={e => setFormData({ ...formData, humanNothingVotes: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                            >
                                {isAdding ? 'Create Problem' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List View */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider bg-zinc-950/50">
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium w-1/3">Text</th>
                            <th className="p-4 font-medium text-center">Human Stats</th>
                            <th className="p-4 font-medium text-center">LLM Votes</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-zinc-500">Loading problems...</td></tr>
                        ) : filteredProblems.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No problems found.</td></tr>
                        ) : (
                            filteredProblems.map(problem => (
                                <tr key={problem.id} className="group hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-4 font-medium text-white group-hover:text-blue-400 transition-colors">
                                        {problem.title}
                                        <span className="block text-xs text-zinc-600 font-mono mt-1">{problem.id}</span>
                                    </td>
                                    <td className="p-4 text-sm text-zinc-400 line-clamp-2">
                                        <p className="line-clamp-2">{problem.text}</p>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="text-xs space-y-1">
                                            <div className="text-green-500">Pull: {problem.humanPullVotes}</div>
                                            <div className="text-red-500">Nothing: {problem.humanNothingVotes}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center text-zinc-400">
                                        {problem.votes?.length || 0}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleRunMissing(problem.id)}
                                            disabled={isRunningMissing[problem.id]}
                                            className="px-3 py-1 text-sm bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 rounded transition-colors disabled:opacity-50"
                                            title="Run for missing LLMs"
                                        >
                                            {isRunningMissing[problem.id] ? 'Running...' : 'Run Missing'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(problem)}
                                            className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(problem.id)}
                                            className="px-3 py-1 text-sm bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded transition-colors"
                                        >
                                            Delete
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
