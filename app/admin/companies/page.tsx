'use client';

import { useState, useEffect } from 'react';

type Provider = {
    id: string;
    name: string;
    logoUrl: string;
    voiceId?: string;
    _count?: {
        llms: number;
    }
};

type Voice = {
    id: string;
    name: string;
};

export default function CompaniesPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

    const [voices, setVoices] = useState<Voice[]>([]);

    // Form state
    const [name, setName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [voiceId, setVoiceId] = useState('');

    useEffect(() => {
        fetchProviders();
        fetchVoices();
    }, []);

    const fetchVoices = async () => {
        try {
            const res = await fetch('/api/admin/voices');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setVoices(data);
            }
        } catch (error) {
            console.error('Failed to fetch voices', error);
        }
    };

    const fetchProviders = async () => {
        try {
            const res = await fetch('/api/admin/providers');
            if (res.ok) {
                const data = await res.json();
                setProviders(data);
            }
        } catch (error) {
            console.error('Failed to fetch providers', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setLogoUrl(data.url);
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error('Upload error', error);
            alert('Error uploding file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (provider: Provider) => {
        setEditingProvider(provider);
        setName(provider.name);
        setLogoUrl(provider.logoUrl);
        setVoiceId(provider.voiceId || '');
    };

    const handleCancel = () => {
        setEditingProvider(null);
        setName('');
        setLogoUrl('');
        setVoiceId('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = editingProvider ? '/api/admin/providers' : '/api/admin/providers';
        const method = editingProvider ? 'PATCH' : 'POST';
        const body = editingProvider
            ? { id: editingProvider.id, name, logoUrl, voiceId }
            : { name, logoUrl, voiceId };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                handleCancel(); // Resets state
                fetchProviders(); // Refresh list
            } else {
                alert('Failed to save company');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving company');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Model Companies</h1>
                <p className="text-zinc-400">Manage AI providers and their branding logos.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Add/Edit Form */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-6 rounded-2xl sticky top-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">{editingProvider ? 'Edit Company' : 'Add New Company'}</h2>
                            {editingProvider && (
                                <button onClick={handleCancel} className="text-xs text-zinc-400 hover:text-white">Cancel</button>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. OpenAI"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Logo</label>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full text-sm text-zinc-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-lg file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-zinc-800 file:text-white
                                            file:cursor-pointer hover:file:bg-zinc-700
                                            block w-full text-sm text-slate-500
                                        "
                                        disabled={isUploading}
                                    />
                                    {isUploading && <p className="text-xs text-yellow-400">Uploading...</p>}
                                    {logoUrl && (
                                        <div className="mt-2 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 flex items-center justify-center flex-col gap-2">
                                            <div className="w-16 h-16 flex items-center justify-center">
                                                <img src={logoUrl} alt="Preview" className="w-full h-full object-contain" />
                                            </div>
                                            <p className="text-xs text-green-400">Logo Ready</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Company Voice</label>
                                <select
                                    value={voiceId}
                                    onChange={(e) => setVoiceId(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">Select a voice...</option>
                                    {voices.map(voice => (
                                        <option key={voice.id} value={voice.id}>{voice.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !logoUrl || isUploading}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : (editingProvider ? 'Update Company' : 'Add Company')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: List */}
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="text-zinc-500 animate-pulse">Loading companies...</div>
                    ) : providers.length === 0 ? (
                        <div className="text-zinc-500 p-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800">
                            No model companies added yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {providers.map(provider => (
                                <div key={provider.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex justify-between items-center gap-4 hover:border-zinc-700 transition-colors group">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-16 h-16 flex items-center justify-center shrink-0">
                                            <img src={provider.logoUrl} alt={provider.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg truncate">{provider.name}</h3>
                                            <p className="text-xs text-zinc-500">
                                                {provider._count?.llms || 0} LLMs associated
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(provider)}
                                        className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        ✏️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Reset input helper could be refined by using a ref if needed, but react-style reset is okay for now.
