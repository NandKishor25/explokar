import api from './api';
import { Review } from '../types';

export const reviewService = {
    // Create a review
    createReview: async (reviewData: {
        reviewer: string;
        reviewee: string;
        tripId: string;
        rating: number;
        comment: string;
    }) => {
        const response = await api.post<Review>('/api/reviews', reviewData);
        return response.data;
    },

    // Get reviews for a user
    getUserReviews: async (userId: string) => {
        const response = await api.get<Review[]>(`/api/reviews/user/${userId}`);
        return response.data;
    }
};
