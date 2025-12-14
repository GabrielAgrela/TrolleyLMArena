import type { Metadata } from 'next';
import { Comic_Neue } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './globals.css';

const comicNeue = Comic_Neue({
    weight: ['300', '400', '700'],
    subsets: ['latin'],
    variable: '--font-comic-neue',
});

export const metadata: Metadata = {
    title: 'Trolley LLM Arena',
    description: 'Evaluate LLMs on moral dilemmas based on the Trolley Problem',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${comicNeue.variable} antialiased`}>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}

