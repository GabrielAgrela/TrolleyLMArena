'use client';

type PaginationControlsProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export default function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 border-t-4 border-black dark:border-zinc-700 gap-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 font-bold uppercase border-2 border-black dark:border-zinc-500 rounded-lg hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
            >
                ← Previous
            </button>

            <div className="flex gap-2 items-center flex-wrap justify-center">
                {getPageNumbers().map((page, i) => (
                    <button
                        key={i}
                        onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                        disabled={page === '...'}
                        className={`w-10 h-10 flex items-center justify-center font-bold border-2 rounded-lg transition-all ${page === currentPage
                            ? 'bg-yellow-400 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-y-1'
                            : page === '...'
                                ? 'border-transparent cursor-default'
                                : 'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 hover:border-black dark:hover:border-white hover:bg-gray-100 dark:hover:bg-zinc-700'
                            }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 font-bold uppercase border-2 border-black dark:border-zinc-500 rounded-lg hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
            >
                Next →
            </button>
        </div>
    );
}

