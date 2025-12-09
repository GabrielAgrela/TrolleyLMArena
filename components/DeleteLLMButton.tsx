'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteLLMButton({ id, name }: { id: string, name: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const handleDelete = async () => {
        if (!confirming) {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 3000); // Reset after 3s
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/llm/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.refresh();
            } else {
                console.error('Failed to delete LLM');
            }
        } catch (error) {
            console.error('Error deleting LLM', error);
        } finally {
            setLoading(false);
            setConfirming(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className={`transition-all text-sm font-semibold px-3 py-1 rounded 
                ${confirming
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                    : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'}`}
        >
            {loading ? 'Deleting...' : confirming ? 'Confirm?' : 'Delete'}
        </button>
    );
}
