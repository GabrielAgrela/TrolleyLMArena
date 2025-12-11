'use client';

import { useEffect, useState } from 'react';
import DeleteLLMButton from './DeleteLLMButton';
import { useRouter } from 'next/navigation';

type Provider = {
    id: string;
    name: string;
    logoUrl: string;
};

type LLM = {
    id: string;
    name: string;
    modelId: string;
    status: string;
    reasoningEffort?: string;
    alignmentScore: number | null;
    totalProblems: number;
    completedProblems: number;
    providerId?: string | null;
    missingTtsCount?: number;
    hasVoice?: boolean;
};

export default function LLMStatusList({ initialLLMs, providers }: { initialLLMs: any[], providers: Provider[] }) {
    const [llms, setLLMs] = useState<LLM[]>(initialLLMs);
    const router = useRouter();

    // Edit State
    const [editingLLM, setEditingLLM] = useState<LLM | null>(null);
    const [editName, setEditName] = useState('');
    const [editProviderId, setEditProviderId] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/admin/llm');
                if (res.ok) {
                    const data = await res.json();
                    // Preserve local edits if polling happens? No, we just overwrite list.
                    // If modal is open, we don't want to disrupt it.
                    setLLMs(data);
                }
            } catch (err) {
                console.error('Failed to poll status', err);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const openEditModal = (llm: LLM) => {
        setEditingLLM(llm);
        setEditName(llm.name);
        setEditProviderId(llm.providerId || '');
        setIsDropdownOpen(false);
    };

    const handleSave = async () => {
        if (!editingLLM) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/llm', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingLLM.id,
                    name: editName,
                    providerId: editProviderId || null
                })
            });

            if (res.ok) {
                setEditingLLM(null);
                // Force immediate refresh
                const refreshRes = await fetch('/api/admin/llm');
                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    setLLMs(data);
                }
                router.refresh();
            } else {
                alert('Failed to update LLM');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating LLM');
        } finally {
            setIsSaving(false);
        }
    };

    const selectedProvider = providers.find(p => p.id === editProviderId);

    const [searchQuery, setSearchQuery] = useState('');

    const filteredLLMs = llms.filter(llm => {
        const query = searchQuery.toLowerCase();
        const providerName = providers.find(p => p.id === llm.providerId)?.name.toLowerCase() || '';
        return (
            llm.name.toLowerCase().includes(query) ||
            llm.modelId.toLowerCase().includes(query) ||
            llm.status.toLowerCase().includes(query) ||
            providerName.includes(query)
        );
    });

    return (
        <div className="space-y-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search evaluations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:border-zinc-500 transition-colors text-white"
                />
                <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {filteredLLMs.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">No evaluations found matching "{searchQuery}"</p>
            ) : (
                filteredLLMs.map((llm) => {
                    const provider = providers.find(p => p.id === llm.providerId);
                    return (
                        <div key={llm.id} className="bg-white/5 p-4 rounded-xl flex justify-between items-center transition-all animate-in fade-in slide-in-from-bottom-2 duration-500 hover:bg-white/10 group">
                            <div className="flex items-center gap-4">
                                {provider && (
                                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                                        <img src={provider.logoUrl} alt={provider.name} className="w-full h-full object-contain" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2">
                                        {llm.name}
                                        {llm.reasoningEffort && llm.reasoningEffort !== 'default' && (
                                            <span className="text-zinc-500 text-xs ml-2 normal-case border border-zinc-700 rounded px-1">
                                                {llm.reasoningEffort}
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-xs text-zinc-500 font-mono">{llm.modelId}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {(llm.missingTtsCount || 0) > 0 && llm.hasVoice && (
                                    <button
                                        onClick={async () => {
                                            if (!confirm(`Generate TTS for ${llm.missingTtsCount} missing votes? This may take a while and incur costs.`)) return;
                                            try {
                                                const res = await fetch(`/api/admin/llm/${llm.id}/tts`, { method: 'POST' });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    alert(`Finished! Generated ${data.converted} audio files.`);
                                                    router.refresh();
                                                } else {
                                                    const err = await res.json();
                                                    alert(`Error: ${err.error || 'Unknown error'}`);
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert('Failed to trigger TTS generation');
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-medium rounded-lg border border-purple-500/30 transition-colors flex items-center gap-2"
                                        title="Generate missing TTS audio"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                        Gen TTS ({llm.missingTtsCount})
                                    </button>
                                )}

                                <div className="text-right flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(llm)}
                                            className="p-1 text-zinc-500 hover:text-white transition-colors rounded hover:bg-white/10"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <DeleteLLMButton id={llm.id} name={llm.name} />
                                    </div>

                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300 ${llm.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                        llm.status === 'RUNNING' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                                            llm.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                                                'bg-zinc-500/20 text-zinc-400'
                                        }`}>
                                        {llm.status}
                                        {llm.status === 'RUNNING' && llm.totalProblems > 0 && (
                                            <span className="ml-1 opacity-75">
                                                ({llm.completedProblems}/{llm.totalProblems})
                                            </span>
                                        )}
                                    </span>
                                    {llm.alignmentScore !== null && (
                                        <div className="text-sm font-bold animate-in fade-in">
                                            {llm.alignmentScore.toFixed(1)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {/* EDIT MODAL */}
            {editingLLM && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setEditingLLM(null)}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 w-full max-w-lg space-y-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold">Edit LLM</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Model Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Company / Provider</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 flex items-center justify-between hover:border-zinc-500 transition-colors"
                                    >
                                        {selectedProvider ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 bg-white rounded p-0.5 flex items-center justify-center">
                                                    <img src={selectedProvider.logoUrl} alt={selectedProvider.name} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="font-medium text-white">{selectedProvider.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-zinc-500">Select a company...</span>
                                        )}
                                        <span className="text-zinc-500 text-xs">▼</span>
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl z-20 max-h-60 overflow-y-auto">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditProviderId('');
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-zinc-700 text-zinc-400 text-sm border-b border-zinc-700"
                                            >
                                                None / Unknown
                                            </button>
                                            {providers.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setEditProviderId(p.id);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-zinc-700 flex items-center gap-3 transition-colors text-white"
                                                >
                                                    <div className="w-8 h-8 bg-white rounded p-1 flex items-center justify-center">
                                                        <img src={p.logoUrl} alt={p.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <span className="font-bold">{p.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {isDropdownOpen && (
                                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                            <button
                                onClick={() => setEditingLLM(null)}
                                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
