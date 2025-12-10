
'use client';

import { useState, useEffect } from 'react';

type Voice = {
    id: string;
    name: string;
    previewUrl?: string;
};

export default function AdminVoicesPage() {
    const [voices, setVoices] = useState<Voice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/voices')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setVoices(data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Voices</h1>
                <p className="text-zinc-400">Available ElevenLabs voices for TTS.</p>
            </header>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider bg-zinc-950/50">
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">ID</th>
                            <th className="p-4 font-medium">Preview</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {isLoading ? (
                            <tr><td colSpan={3} className="p-8 text-center text-zinc-500">Loading voices...</td></tr>
                        ) : voices.length === 0 ? (
                            <tr><td colSpan={3} className="p-8 text-center text-zinc-500">No voices found. Check API Key.</td></tr>
                        ) : (
                            voices.map(voice => (
                                <tr key={voice.id} className="group hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-4 font-medium text-white">{voice.name}</td>
                                    <td className="p-4 text-zinc-500 font-mono text-xs">{voice.id}</td>
                                    <td className="p-4">
                                        {voice.previewUrl && (
                                            <audio controls src={voice.previewUrl} className="h-8 w-64" />
                                        )}
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
