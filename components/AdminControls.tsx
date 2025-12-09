
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminControls() {
    const router = useRouter();
    const [modelId, setModelId] = useState('');
    const [name, setName] = useState('');
    const [reasoningEffort, setReasoningEffort] = useState('default');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelId, name, reasoningEffort: reasoningEffort === 'default' ? undefined : reasoningEffort }),
            });

            if (res.ok) {
                alert('Run started successfully!');
                setModelId('');
                setName('');
                setReasoningEffort('default');
                router.refresh();
            } else {
                alert('Failed to start run.');
            }
        } catch (err) {
            console.error(err);
            alert('Error starting run.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-8 rounded-3xl space-y-6">
            <h2 className="text-2xl font-bold">Add New LLM</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">Model Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="e.g. GPT-4 Turbo"
                    />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">OpenRouter Model ID</label>
                    <input
                        type="text"
                        required
                        value={modelId}
                        onChange={(e) => setModelId(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="e.g. openai/gpt-4-turbo-preview"
                    />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">Reasoning Effort (Optional)</label>
                    <select
                        value={reasoningEffort}
                        onChange={(e) => setReasoningEffort(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors text-white"
                    >
                        <option value="default">Default / Not Applicable</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Starting Run...' : 'Start Evaluation'}
                </button>
            </form>
        </div>
    );
}
