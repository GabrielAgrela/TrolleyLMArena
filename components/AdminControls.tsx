'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Provider = {
    id: string;
    name: string;
    logoUrl: string;
};

export default function AdminControls({ providers }: { providers: Provider[] }) {
    const router = useRouter();
    const [modelId, setModelId] = useState('');
    const [name, setName] = useState('');
    const [providerId, setProviderId] = useState('');
    const [reasoningEffort, setReasoningEffort] = useState('default');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelId,
                    name,
                    providerId: providerId || undefined,
                    reasoningEffort: reasoningEffort === 'default' ? undefined : reasoningEffort
                }),
            });

            if (res.ok) {
                setStatus({ type: 'success', message: 'Run started successfully!' });
                setModelId('');
                setName('');
                setProviderId('');
                setReasoningEffort('default');
                router.refresh();
                setTimeout(() => setStatus({ type: null, message: '' }), 3000);
            } else {
                setStatus({ type: 'error', message: 'Failed to start run.' });
            }
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Error starting run.' });
        } finally {
            setLoading(false);
        }
    };

    const selectedProvider = providers.find(p => p.id === providerId);

    return (
        <div className="glass-panel p-8 rounded-3xl space-y-6">
            <h2 className="text-2xl font-bold">Add New LLM</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">Company / Provider (Optional)</label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between hover:border-zinc-500 transition-colors"
                        >
                            {selectedProvider ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        <img src={selectedProvider.logoUrl} alt={selectedProvider.name} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="font-medium">{selectedProvider.name}</span>
                                </div>
                            ) : (
                                <span className="text-zinc-500">Select a company...</span>
                            )}
                            <span className="text-zinc-500 text-xs">▼</span>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-xl z-20 max-h-60 overflow-y-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProviderId('');
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-zinc-800 text-zinc-400 text-sm border-b border-zinc-800 flex items-center gap-3"
                                >
                                    <span className="font-bold">None / Unknown</span>
                                </button>
                                {providers.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                            setProviderId(p.id);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            <img src={p.logoUrl} alt={p.name} className="w-full h-full object-contain" />
                                        </div>
                                        <span className="font-bold">{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Overlay to close on click outside */}
                        {isDropdownOpen && (
                            <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                        )}
                    </div>
                </div>

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
                {status.message && (
                    <div className={`text-center text-sm p-3 rounded-lg ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                        {status.message}
                    </div>
                )}
            </form>
        </div>
    );
}
