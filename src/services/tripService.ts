import api from './api';
import { Trip, Comment } from '../types';

export const tripService = {
    // Get all trips (search)
    searchTrips: async (params: URLSearchParams) => {
        const response = await api.get<Trip[]>(`/api/trips/search?${params.toString()}`);
        return response.data;
    },

    // Get a single trip by ID
    getTripById: async (id: string) => {
        const response = await api.get<Trip>(`/api/trips/${id}`);
        return response.data;
    },

    // Get trips for a specific user
    getUserTrips: async (userId: string) => {
        const response = await api.get<Trip[]>(`/api/trips/user/${userId}`);
        return response.data;
    },

    // Create a new trip
    createTrip: async (tripData: Partial<Trip>) => {
        const response = await api.post<Trip>('/api/trips', tripData);
        return response.data;
    },

    // Delete a trip
    deleteTrip: async (id: string) => {
        const response = await api.delete(`/api/trips/${id}`);
        return response.data;
    },

    // Join a trip
    joinTrip: async (tripId: string, userData: { userId: string; name: string; photoURL: string; message?: string }) => {
        const response = await api.post(`/api/trips/${tripId}/join`, userData);
        return response.data;
    },

    // Leave a trip
    leaveTrip: async (tripId: string, userData: { userId: string }) => {
        const response = await api.post(`/api/trips/${tripId}/leave`, userData);
        return response.data;
    },

    // Get comments for a trip
    getComments: async (tripId: string) => {
        const response = await api.get<Comment[]>(`/api/trips/${tripId}/comments`);
        return response.data;
    },

    // Add a comment
    addComment: async (tripId: string, commentData: Partial<Comment>) => {
        const response = await api.post<Comment>(`/api/trips/${tripId}/comments`, commentData);
        return response.data;
    },

    // Get expenses for a trip
    getExpenses: async (tripId: string) => {
        try {
            const response = await api.get(`/api/trips/${tripId}/expenses`);
            return response.data;
        } catch (e) {
            console.warn("Expense API not ready, returning mock data");
            return [];
        }
    },

    // Add an expense
    addExpense: async (tripId: string, expenseData: any) => {
        const response = await api.post(`/api/trips/${tripId}/expenses`, expenseData);
        return response.data;
    },

    // Delete an expense
    deleteExpense: async (tripId: string, expenseId: string) => {
        const response = await api.delete(`/api/trips/${tripId}/expenses/${expenseId}`);
        return response.data;
    }
};
