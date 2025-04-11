import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MapPin, Calendar, Edit, Trash2, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Trip {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  imageUrl: string;
  description: string;
}

function Profile() {
  const { currentUser, loading: authLoading } = useAuth();
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTrips = async () => {
      try {
        if (currentUser) {
          const response = await axios.get(`/api/trips/user/${currentUser.uid}`);
          console.log('Fetched Trips:', response.data); // Debugging
          
          // Ensure response is an array
          setUserTrips(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Error fetching user trips:', error);
        toast.error('Failed to load your trips');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && currentUser) {
      fetchUserTrips();
    }
  }, [currentUser, authLoading]);

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await axios.delete(`/api/trips/${tripId}`);
        setUserTrips(prevTrips => prevTrips.filter(trip => trip._id !== tripId));
        toast.success('Trip deleted successfully');
      } catch (error) {
        console.error('Error deleting trip:', error);
        toast.error('Failed to delete trip');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          <Link 
            to="/login" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-block"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-indigo-600 h-32 md:h-48"></div>
        <div className="px-4 py-6 md:px-6 md:py-8 -mt-16 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName || 'User'} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.displayName || 'User') + '&background=random';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                <User className="w-16 h-16" />
              </div>
            )}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {currentUser.displayName || 'User'}
          </h1>
          <p className="text-gray-600">{currentUser.email}</p>
          
          <div className="mt-6 flex space-x-4">
            <Link 
              to="/edit-profile" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* User's Trips */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Trips</h2>
          <Link 
            to="/create-trip" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create New Trip
          </Link>
        </div>

        {userTrips.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">You haven't created any trips yet.</p>
            <Link 
              to="/create-trip" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-block"
            >
              Create Your First Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(userTrips) &&
              userTrips.map(trip => (
                <div key={trip._id} className="bg-white shadow rounded-lg overflow-hidden">
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
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-3">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(trip.startDate)}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{trip.description}</p>
                    <div className="flex justify-between">
                      <Link 
                        to={`/trip/${trip._id}`} 
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Details
                      </Link>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleDeleteTrip(trip._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
