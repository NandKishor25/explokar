import React from 'react';
import Navbar from '@/components/Navbar';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main className="pt-20 min-h-screen">
                {children}
            </main>
        </>
    );
}
