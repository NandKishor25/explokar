'use client';

import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; -> next/link
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Calendar, Edit, Trash2, User, Plus, ExternalLink, Mail, LogIn, Star, MessageSquare } from 'lucide-react';
import { tripService } from '@/services/tripService';
import { reviewService } from '@/services/reviewService';
import toast from 'react-hot-toast';

import { Trip, Review } from '@/types';

const Profile = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [userTrips, setUserTrips] = useState<Trip[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            // 1. If auth finishes and no user exists, stop loading immediately
            if (!authLoading && !currentUser) {
                setLoading(false);
                return;
            }

            // 2. If we have a user, fetch their data
            if (currentUser) {
                try {
                    const [trips, userReviews] = await Promise.all([
                        tripService.getUserTrips(currentUser.uid),
                        reviewService.getUserReviews(currentUser.uid)
                    ]);

                    setUserTrips(Array.isArray(trips) ? trips : []);
                    setReviews(Array.isArray(userReviews) ? userReviews : []);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    toast.error('Failed to load profile data');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserData();
    }, [currentUser, authLoading]);

    const handleDeleteTrip = async (tripId: string) => {
        if (window.confirm('Are you sure you want to delete this trip?')) {
            try {
                await tripService.deleteTrip(tripId);
                setUserTrips(prevTrips => prevTrips.filter(trip => trip._id !== tripId));
                toast.success('Trip deleted successfully');
            } catch (error) {
                console.error('Error deleting trip:', error);
                toast.error('Failed to delete trip');
            }
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return 'Date TBD';
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 'New';

    // --- RENDER LOGIC ---

    // Show spinner ONLY while auth is checking OR if we are logged in and waiting for data
    if (authLoading || (currentUser && loading)) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[70vh] space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-500 font-medium animate-pulse">Loading your profile...</p>
            </div>
        );
    }

    // Show Login State if not authenticated
    if (!currentUser) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 max-w-md mx-auto border border-gray-100">
                    <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                        <User className="w-10 h-10 text-indigo-600 -rotate-3" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in Required</h2>
                    <p className="text-gray-500 mb-8">Please log in to manage your journeys and view your saved trips.</p>
                    <Link
                        href="/login"
                        className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        <LogIn className="w-5 h-5" />
                        Sign In to Continue
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Profile Header */}
            <div className="relative">
                <div className="h-60 md:h-72 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800"></div>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="relative -mt-24">
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-gray-200/60 p-6 md:p-10 border border-white flex flex-col md:flex-row items-center md:items-end gap-8">
                            {/* Avatar Section */}
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-[2rem] border-[6px] border-white overflow-hidden shadow-2xl bg-gray-50 bg-white">
                                    <img
                                        src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=6366f1&color=fff`}
                                        alt="Profile"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <Link href="/edit-profile" className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg border-4 border-white hover:bg-indigo-700 transition-all scale-90 group-hover:scale-100">
                                    <Edit className="w-5 h-5" />
                                </Link>
                            </div>

                            {/* User Info Section */}
                            <div className="flex-1 text-center md:text-left mb-2">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                                        Explorer Account
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none mb-2">
                                    {currentUser.displayName || 'Traveler'}
                                </h1>

                                {/* Stats Row */}
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-gray-500 mt-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                                        <Mail className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm font-medium">{currentUser.email}</span>
                                    </div>

                                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100 text-amber-900">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        <span className="text-sm font-bold">{averageRating}</span>
                                        <span className="text-xs opacity-70">({reviews.length} reviews)</span>
                                    </div>

                                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100 text-blue-900">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-bold">{userTrips.length}</span>
                                        <span className="text-xs opacity-70">Trips Created</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-3 w-full md:w-auto">
                                <Link
                                    href="/create-trip"
                                    className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center shadow-xl shadow-indigo-100 group"
                                >
                                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                                    New Trip
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Trips */}
                <div className="lg:col-span-2">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Your Adventures</h2>
                            <p className="text-gray-500 mt-1">Manage and explore your planned journeys</p>
                        </div>
                        <div className="h-1 w-20 bg-indigo-600 rounded-full hidden md:block mb-2"></div>
                    </div>

                    {userTrips.length === 0 ? (
                        <div className="bg-white border-4 border-dashed border-gray-100 rounded-[3rem] p-20 text-center">
                            <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MapPin className="w-10 h-10 text-indigo-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Ready for a new story?</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto mt-2">You haven't created any trips yet. Your next passport stamp is just a click away.</p>
                            <Link
                                href="/create-trip"
                                className="inline-flex items-center px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                            >
                                Plan Your First Trip
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {userTrips.map(trip => (
                                <div key={trip._id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 flex flex-col">
                                    {/* Image Wrapper */}
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={trip.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'}
                                            alt={trip.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-5 right-5 flex gap-2">
                                            <button
                                                onClick={() => handleDeleteTrip(trip._id)}
                                                className="p-3 bg-white/90 backdrop-blur-md text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-5 left-5">
                                            <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-xs font-black uppercase tracking-widest text-indigo-600 shadow-sm">
                                                {trip.destination}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-center text-gray-400 text-xs font-bold mb-3">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {formatDate(trip.startDate)}
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{trip.title}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-8 leading-relaxed italic">
                                            "{trip.description || 'No description provided for this adventure.'}"
                                        </p>

                                        <div className="mt-auto">
                                            <Link
                                                href={`/trip/${trip._id}`}
                                                className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold text-sm flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all border border-gray-100 hover:border-indigo-600 shadow-sm"
                                            >
                                                Explore Journey
                                                <ExternalLink className="w-4 h-4 ml-2" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Reviews */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sticky top-24">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900">Reviews</h2>
                            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                        </div>

                        {reviews.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-400 font-medium">No reviews yet.</p>
                                <p className="text-xs text-gray-300 mt-2">Complete trips to get rated!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {reviews.map(review => (
                                    <div key={review._id} className="pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex items-center mb-3">
                                            <div className="flex text-amber-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="ml-auto text-xs text-gray-400 font-medium">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-3">"{review.comment}"</p>
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden mr-3">
                                                {/* Handle if reviewer is populated object or ID string. Type says string | object */}
                                                {typeof review.reviewer === 'object' && review.reviewer.photoURL ? (
                                                    <img src={review.reviewer.photoURL} alt="Reviewer" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">?</div>
                                                )}
                                            </div>
                                            <span className="text-xs font-bold text-gray-900">
                                                {typeof review.reviewer === 'object' ? review.reviewer.name : 'Traveler'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
