'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { tripService } from '@/services/tripService';
import TripCard from '@/components/TripCard';
import { Trip } from '@/types';
import { Compass, Plus } from 'lucide-react';

const MyTrips = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserTrips = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const userTrips = await tripService.getUserTrips(currentUser.uid);
                // Ensure we always set an array, even if the response is unexpected
                setTrips(Array.isArray(userTrips) ? userTrips : []);
            } catch (err) {
                console.error('Error fetching user trips:', err);
                setError('Failed to load your trips. Please try again later.');
                // Ensure trips is set to empty array on error
                setTrips([]);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchUserTrips();
        }
    }, [currentUser, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your trips</h2>
                        <button
                            onClick={() => router.push('/login')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/20"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <p className="text-red-600 text-lg">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">My Trips</h1>
                    <p className="text-slate-600">Manage and view all your created trips</p>
                </div>

                {/* Trips Grid */}
                {trips.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip) => (
                            <TripCard key={trip._id} trip={trip} />
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                                <Compass className="w-12 h-12 text-blue-600" strokeWidth={2} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">No trips yet</h2>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            You haven't created any trips yet. Start planning your next adventure and share it with fellow travelers!
                        </p>
                        <button
                            onClick={() => router.push('/create-trip')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/20"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Trip
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTrips;
