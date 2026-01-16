import { ChatMessage } from '../types';

export const chatService = {
    // Get all messages for a trip
    getMessages: async (tripId: string, userId: string): Promise<ChatMessage[]> => {
        const response = await fetch(`/api/trips/${tripId}/chat`, {
            headers: { 'x-user-id': userId }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }
        return response.json();
    },

    // Send a new message
    sendMessage: async (
        tripId: string,
        userId: string,
        data: { senderName: string; senderPhoto: string; message: string }
    ): Promise<ChatMessage> => {
        const response = await fetch(`/api/trips/${tripId}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': userId
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Failed to send message');
        }
        return response.json();
    },

    // Get all trips user is part of (for inbox)
    getUserChats: async (userId: string): Promise<any[]> => {
        const response = await fetch('/api/chats', {
            headers: { 'x-user-id': userId }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch chats');
        }
        return response.json();
    }
};
