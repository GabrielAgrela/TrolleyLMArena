'use client';

import React, { Component, ReactNode } from 'react';

type ErrorBoundaryProps = {
    children: ReactNode;
    fallback?: ReactNode;
};

type ErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};

/**
 * Error boundary component with comic-style fallback UI
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // If custom fallback provided, use it
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default comic-style fallback UI
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 max-w-md text-center">
                        <div className="text-6xl mb-4">💥</div>
                        <h2 className="font-black text-2xl uppercase tracking-wider mb-2 font-comic">
                            Oops! Something Went Wrong
                        </h2>
                        <p className="text-zinc-600 mb-6 font-comic">
                            The trolley hit an unexpected obstacle. Don't worry, no one was harmed.
                        </p>
                        {this.state.error && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-6 text-left">
                                <p className="text-xs font-mono text-red-600 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="px-6 py-3 bg-yellow-400 text-black font-black rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-widest text-sm font-comic"
                        >
                            Try Again 🔄
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
