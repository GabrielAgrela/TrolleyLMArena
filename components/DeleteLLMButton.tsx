'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteLLMButton({ id, name }: { id: string, name: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${name}? This will remove all associated votes.`)) {
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
                alert('Failed to delete LLM');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting LLM');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="text-red-400 hover:text-red-300 transition-colors text-sm font-semibold px-3 py-1 rounded hover:bg-red-500/10"
        >
            {loading ? 'Deleting...' : 'Delete'}
        </button>
    );
}
