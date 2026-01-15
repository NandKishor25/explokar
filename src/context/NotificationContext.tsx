'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notificationService';
import { INotification } from '@/types';

// Define the shape of the context
interface NotificationContextType {
    notifications: INotification[];
    unreadCount: number;
    loading: boolean;
    refreshNotifications: () => Promise<void>;
    markAsRead: (id?: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const refreshNotifications = async () => {
        if (!currentUser?.uid) return;
        try {
            const data = await notificationService.getNotifications(currentUser.uid);
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id?: string) => {
        if (!currentUser?.uid) return;
        try {
            // Optimistic update
            if (id) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
                await notificationService.markRead(currentUser.uid, id);
            }
        } catch (error) {
            console.error('Failed to mark as read', error);
            refreshNotifications(); // Revert on error
        }
    };

    const markAllAsRead = async () => {
        if (!currentUser?.uid) return;
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            await notificationService.markRead(currentUser.uid, undefined, true);
        } catch (error) {
            console.error('Failed to mark all as read', error);
            refreshNotifications();
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        if (currentUser?.uid) {
            refreshNotifications();

            // Poll every 30 seconds
            const interval = setInterval(refreshNotifications, 30000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [currentUser?.uid]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            refreshNotifications,
            markAsRead,
            markAllAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
