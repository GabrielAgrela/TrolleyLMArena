'use client';

type PayloadModalProps = {
    content: string;
    onClose: () => void;
};

export default function PayloadModal({ content, onClose }: PayloadModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border-4 border-black dark:border-zinc-600 shadow-[8px_8px_0px_rgba(0,0,0,1)] w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
                <div className="p-4 border-b-4 border-black dark:border-zinc-600 bg-yellow-400 flex justify-between items-center">
                    <h3 className="font-black text-xl uppercase tracking-wider font-comic text-black">Transmitted Payload</h3>
                    <button onClick={onClose} className="p-2 hover:bg-black hover:text-white rounded-lg transition-colors border-2 border-black bg-white">
                        ✕
                    </button>
                </div>
                <div className="p-6 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 font-mono text-xs dark:text-zinc-300">
                    <pre className="whitespace-pre-wrap break-all">{content}</pre>
                </div>
            </div>
        </div>
    );
}

