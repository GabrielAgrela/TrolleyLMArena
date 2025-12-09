'use client';

import { useEffect, useState } from 'react';
import DeleteLLMButton from './DeleteLLMButton';

export default function LLMStatusList({ initialLLMs }: { initialLLMs: any[] }) {
    const [llms, setLLMs] = useState(initialLLMs);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/admin/llm');
                if (res.ok) {
                    const data = await res.json();
                    setLLMs(data);
                }
            } catch (err) {
                console.error('Failed to poll status', err);
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4">
            {llms.length === 0 ? (
                <p className="text-zinc-500">No evaluations found.</p>
            ) : (
                llms.map((llm) => (
                    <div key={llm.id} className="bg-white/5 p-4 rounded-xl flex justify-between items-center transition-all animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                        <div className="text-right flex flex-col items-end gap-2">
                            <div className="flex items-center gap-3">
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
                                <DeleteLLMButton id={llm.id} name={llm.name} />
                            </div>
                            {llm.alignmentScore !== null && (
                                <div className="text-sm font-bold animate-in fade-in">
                                    {llm.alignmentScore.toFixed(1)}%
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
