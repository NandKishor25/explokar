'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Star, ArrowLeft, User as UserIcon, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
    uid: string;
    name: string;
    email: string;
    photoURL: string;
    bio: string;
    location: string;
    createdAt: string;
}

interface TripSummary {
    _id: string;
    title: string;
    destination: string;
    startDate: string;
    imageUrl: string;
    participants: number;
    maxParticipants: number;
}

interface Review {
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: string | { name: string; photoURL: string; uid: string };
}

interface Stats {
    tripsCreated: number;
    averageRating: string | null;
    reviewCount: number;
}

const PublicProfile = () => {
    const params = useParams();
    const userId = params?.id as string;
    const router = useRouter();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [trips, setTrips] = useState<TripSummary[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/users/${userId}`);
                if (!res.ok) {
                    throw new Error('User not found');
                }
                const data = await res.json();
                setUser(data.user);
                setTrips(data.trips);
                setReviews(data.reviews);
                setStats(data.stats);
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return 'Date TBD';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[70vh] space-y-4">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
                <button onClick={() => router.back()} className="text-indigo-600 hover:text-indigo-800">
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 pt-6">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
            </div>

            {/* Profile Header */}
            <div className="relative mt-4">
                <div className="h-48 md:h-56 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800"></div>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="relative -mt-20">
                        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl p-6 md:p-10 border border-white flex flex-col md:flex-row items-center md:items-end gap-6">
                            {/* Avatar */}
                            <div className="w-32 h-32 rounded-[1.5rem] border-4 border-white overflow-hidden shadow-xl bg-white">
                                <img
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=6366f1&color=fff`}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{user.name}</h1>
                                {user.bio && <p className="text-gray-600 mb-3">{user.bio}</p>}

                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    {user.location && (
                                        <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{user.location}</span>
                                        </div>
                                    )}

                                    {stats?.averageRating && (
                                        <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 rounded-full text-sm text-amber-700">
                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                            <span className="font-bold">{stats.averageRating}</span>
                                            <span className="text-amber-600">({stats.reviewCount} reviews)</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-full text-sm text-blue-700">
                                        <MapPin className="w-4 h-4" />
                                        <span className="font-bold">{stats?.tripsCreated || 0}</span>
                                        <span>Trips</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trips Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Trips</h2>
                    {trips.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                            <p className="text-gray-500">No trips yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {trips.map(trip => (
                                <Link key={trip._id} href={`/trip/${trip._id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100">
                                    <div className="h-40 overflow-hidden">
                                        <img
                                            src={trip.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'}
                                            alt={trip.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-1 truncate">{trip.title}</h3>
                                        <div className="flex items-center text-sm text-gray-500 gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{trip.destination}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-400 mt-2 gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(trip.startDate)}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                        {reviews.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No reviews yet</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.slice(0, 5).map(review => (
                                    <div key={review._id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                                                />
                                            ))}
                                            <span className="text-xs text-gray-400 ml-2">{formatDate(review.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">"{review.comment}"</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            - {typeof review.reviewer === 'object' ? review.reviewer.name : 'Anonymous'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
