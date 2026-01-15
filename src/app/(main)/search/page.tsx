'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Users, Filter } from 'lucide-react';
import { tripService } from '@/services/tripService';
import toast from 'react-hot-toast';

import { Trip } from '@/types';

const SearchResultsContent = () => {
    const searchParams = useSearchParams();

    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        from: searchParams?.get('from') || '',
        to: searchParams?.get('to') || '',
        date: searchParams?.get('date') || '',
        transportMode: '',
        preferredGender: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // Update filters if URL params change
        setFilters(prev => ({
            ...prev,
            from: searchParams?.get('from') || prev.from,
            to: searchParams?.get('to') || prev.to,
            date: searchParams?.get('date') || prev.date
        }));
    }, [searchParams]);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                setLoading(true);

                // Build query params
                const params = new URLSearchParams();
                if (filters.from) params.append('startLocation', filters.from);
                if (filters.to) params.append('destination', filters.to);
                if (filters.date) params.append('startDate', filters.date);
                if (filters.transportMode) params.append('transportMode', filters.transportMode);
                if (filters.preferredGender) params.append('preferredGender', filters.preferredGender);

                const results = await tripService.searchTrips(params);
                // Ensure we're setting an array, even if empty
                setTrips(Array.isArray(results) ? results : []);
            } catch (error) {
                console.error('Error fetching trips:', error);
                toast.error('Failed to load trips');
                // Set empty array on error to prevent mapping issues
                setTrips([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, [filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
                                From
                            </label>
                            <input
                                type="text"
                                id="from"
                                name="from"
                                value={filters.from}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Starting location"
                            />
                        </div>

                        <div>
                            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                                To
                            </label>
                            <input
                                type="text"
                                id="to"
                                name="to"
                                value={filters.to}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Destination"
                            />
                        </div>

                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={filters.date}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="transportMode" className="block text-sm font-medium text-gray-700 mb-1">
                                Transport Mode
                            </label>
                            <select
                                id="transportMode"
                                name="transportMode"
                                value={filters.transportMode}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Any</option>
                                <option value="flight">Flight</option>
                                <option value="train">Train</option>
                                <option value="car">Car</option>
                                <option value="bus">Bus</option>
                                <option value="bike">Bike</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="preferredGender" className="block text-sm font-medium text-gray-700 mb-1">
                                Preferred Gender
                            </label>
                            <select
                                id="preferredGender"
                                name="preferredGender"
                                value={filters.preferredGender}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Any</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : trips.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h2>
                    <p className="text-gray-600 mb-4">Try adjusting your search filters or create your own trip!</p>
                    <Link
                        href="/create-trip"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-block"
                    >
                        Create a Trip
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map(trip => (
                        <Link
                            key={trip._id}
                            href={`/trip/${trip._id}`}
                            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={trip.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'}
                                    alt={trip.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{trip.title}</h3>

                                <div className="flex items-center text-gray-600 mb-2">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span>{trip.startLocation} to {trip.destination}</span>
                                </div>

                                <div className="flex items-center text-gray-600 mb-2">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>{formatDate(trip.startDate)} • {trip.duration} days</span>
                                </div>

                                <div className="flex items-center text-gray-600 mb-4">
                                    <Users className="w-4 h-4 mr-1" />
                                    <span>Looking for {trip.maxParticipants} travel buddies</span>
                                </div>

                                <div className="flex items-center mt-4">
                                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                                        {trip.createdBy.photoURL ? (
                                            <img
                                                src={trip.createdBy.photoURL}
                                                alt={trip.createdBy.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-sm font-bold">
                                                {trip.createdBy.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-600">Created by {trip.createdBy.name}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

const SearchResults = () => {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>}>
            <SearchResultsContent />
        </Suspense>
    );
};

export default SearchResults;
