
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await signIn('credentials', {
            password,
            redirect: false,
        });

        if (res?.error) {
            setError(true);
        } else {
            router.push('/admin');
            router.refresh();
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
            <div className="max-w-md w-full glass-panel p-8 rounded-3xl space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Admin Access</h1>
                    <p className="text-zinc-400 text-sm">Enter the secret password to continue.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 text-center text-lg focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Password"
                        />
                        {error && <p className="text-red-500 text-sm mt-2 text-center">Invalid password</p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-lg transition-all"
                    >
                        Unlock
                    </button>
                </form>
            </div>
        </main>
    );
}
