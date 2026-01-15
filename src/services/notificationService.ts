export const notificationService = {
    getNotifications: async (userId: string) => {
        const res = await fetch('/api/notifications', {
            headers: { 'x-user-id': userId }
        });
        return res.json();
    },
    markRead: async (userId: string, notificationId?: string, markAll?: boolean) => {
        return fetch('/api/notifications', {
            method: 'PUT',
            headers: { 'x-user-id': userId, 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId, markAll })
        });
    }
};
