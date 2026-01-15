'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, MapPin, Users, Compass, ArrowRight } from 'lucide-react';
import OlaAutocompleteInput from '@/components/OlaAutocompleteInput';
import TripCard from '@/components/TripCard';
import { tripService } from '@/services/tripService';
import { Trip } from '@/types';

const Home = () => {
    const router = useRouter();
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const data = await tripService.searchTrips(new URLSearchParams());
                setTrips(data);
            } catch (error) {
                console.error('Error fetching trips:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!from || !to || !date) return;
        router.push(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative min-h-[600px] h-[70vh] flex items-center justify-center bg-slate-800">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt="Mountain Landscape"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-800/40 via-slate-800/30 to-slate-800/70" />
                </div>

                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm text-slate-300 mb-4 uppercase tracking-wider">Over 1,000+ trips added this week</p>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
                        Discover the Uncharted.<br />Travel Together.
                    </h1>
                    <p className="text-lg text-slate-200 mb-12 max-w-2xl mx-auto">
                        Find your tribe and explore unique destinations. From weekend getaways to month-long expeditions.
                    </p>

                    {/* Search Widget */}
                    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-2 flex flex-col md:flex-row items-center gap-2">
                        <div className="flex-1 w-full flex items-center px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <MapPin className="h-5 w-5 text-slate-400 mr-3" />
                            <OlaAutocompleteInput
                                name="from"
                                value={from}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFrom(e.target.value)}
                                onPlaceSelect={(place: string) => setFrom(place)}
                                placeholder="Leaving from"
                                className="w-full bg-transparent border-none p-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 text-base"
                                containerClassName="w-full"
                            />
                        </div>

                        <div className="flex-1 w-full flex items-center px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <MapPin className="h-5 w-5 text-slate-400 mr-3" />
                            <OlaAutocompleteInput
                                name="to"
                                value={to}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
                                onPlaceSelect={(place: string) => setTo(place)}
                                placeholder="Dream destination"
                                className="w-full bg-transparent border-none p-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 text-base"
                                containerClassName="w-full"
                            />
                        </div>

                        <div className="flex-1 w-full flex items-center px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <Calendar className="h-5 w-5 text-slate-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Any dates"
                                className="w-full bg-transparent border-none p-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 text-base"
                                onFocus={(e) => (e.target.type = 'date')}
                                onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            onClick={handleSearch}
                            className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3.5 rounded-lg font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 min-w-[140px]"
                        >
                            <Search className="h-5 w-5" />
                            Explore
                        </button>
                    </div>
                </div>
            </div>

            {/* Upcoming Trips Section */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-900">Upcoming Trips</h2>
                    <button
                        onClick={() => router.push('/search')}
                        className="text-cyan-600 font-semibold hover:text-cyan-700 flex items-center gap-1"
                    >
                        View All <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.length > 0 ? (
                            trips.map((trip) => (
                                <TripCard key={trip._id} trip={trip} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl">
                                <p className="text-slate-500 text-lg">No trips found. Be the first to create one!</p>
                                <button
                                    onClick={() => router.push('/create-trip')}
                                    className="mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
                                >
                                    Create Trip
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Philosophy / Benefits */}
            <section className="py-24 bg-stone-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80"
                                    alt="Friends traveling"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="absolute -bottom-8 -right-8 w-64 p-6 bg-white rounded-xl shadow-xl hidden md:block">
                                <p className="font-serif text-xl text-stone-900 mb-2">"Found my best friend here."</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-stone-200 rounded-full overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-bold text-stone-900">Sarah M.</p>
                                        <p className="text-stone-500">Traveler since 2023</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-cyan-500 font-semibold tracking-wider text-sm uppercase mb-4 block">Why Explokar?</span>
                            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-6 leading-tight">
                                Travel is better <br /> <span className="text-stone-500 italic">together.</span>
                            </h2>
                            <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                                Solo travel is freedom, but shared travel is connection. We built Explokar to bridge the gap between solitude and companionship, ensuring you never have to explore alone unless you want to.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { icon: Users, title: "Verified Community", desc: "Connect with real profiles verified for safety and trust." },
                                    { icon: Compass, title: "Shared Itineraries", desc: "Co-create plans and split costs effortlessly." },
                                    { icon: MapPin, title: "Local Gems", desc: "Discover hidden spots recommended by fellow travelers." }
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cyan-200 flex items-center justify-center text-cyan-500">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-stone-900">{item.title}</h4>
                                            <p className="text-stone-600">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-900">
                    <img
                        src="https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt="Camping"
                        className="w-full h-full object-cover opacity-20 mix-blend-overlay"
                    />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-6">Your next story begins here.</h2>
                    <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto font-light">
                        Join the world's most supportive travel community. It only takes a minute to start your journey.
                    </p>
                    <button
                        onClick={() => router.push('/register')}
                        className="bg-white text-emerald-950 px-10 py-4 rounded-full font-bold text-lg hover:bg-stone-100 transition-colors shadow-xl"
                    >
                        Start Your Journey
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Home;
