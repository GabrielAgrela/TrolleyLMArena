'use client';

import { clsx } from 'clsx';

type SearchBarProps = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder = "Search models..." }: SearchBarProps) {
    return (
        <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
            </div>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full pl-10 pr-4 py-2 border-2 border-black dark:border-zinc-500 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-black dark:focus:border-white transition-all bg-white dark:bg-zinc-800 dark:text-white shadow-[2px_2px_0px_rgba(0,0,0,0.1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_rgba(255,255,255,0.3)]"
            />
        </div>
    );
}

