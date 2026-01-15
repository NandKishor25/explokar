'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthInitializer } from '@/components/AuthInitializer';
import { NotificationProvider } from '@/context/NotificationContext';
import { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <Provider store={store}>
            <AuthInitializer />
            <Toaster position="top-right" />
            <NotificationProvider>
                {children}
            </NotificationProvider>
        </Provider>
    );
}
