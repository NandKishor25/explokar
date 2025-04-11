import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MapPin, Calendar, Users, Info, Plane, Bus, Car, Bike, Train } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Define interfaces
interface TripFormData {
  title: string;
  startLocation: string;
  destination: string;
  startDate: string;
  duration: string;
  maxParticipants: string;
  preferredGender: 'any' | 'male' | 'female';
  transportMode: string;
  description: string;
  budget: string;
  activities: string;
}

const CreateTrip: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  console.log(currentUser)
  const navigate = useNavigate();

  const [formData, setFormData] = useState<TripFormData>({
    title: '',
    startLocation: '',
    destination: '',
    startDate: '',
    duration: '',
    maxParticipants: '',
    preferredGender: 'any',
    transportMode: '',
    description: '',
    budget: '',
    activities: '',
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTransportSelect = (mode: string) => {
    setFormData(prev => ({ ...prev, transportMode: mode }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('You must be logged in to create a trip');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      // Add user ID to the form data
      const tripData = {
        ...formData,
        userId: currentUser.uid,
      };

      // Make the API call
      const response = await axios.post('http://localhost:5000/api/trips/create', tripData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success('Trip created successfully!');
      navigate(`/trip/${response.data._id}`);
    } catch (error: any) {
      console.error('Error creating trip:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create trip';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to create a trip</h2>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create a New Trip</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Trip Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Weekend Getaway to Bali"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700 mb-1">
              Starting Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                id="startLocation"
                name="startLocation"
                required
                value={formData.startLocation}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="City, Country"
              />
            </div>
          </div>

          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                id="destination"
                name="destination"
                required
                value={formData.destination}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="City, Country"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (days)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              required
              min="1"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., 7"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Participants
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                required
                min="1"
                value={formData.maxParticipants}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 4"
              />
            </div>
          </div>

          <div>
            <label htmlFor="preferredGender" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Gender
            </label>
            <select
              id="preferredGender"
              name="preferredGender"
              value={formData.preferredGender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="any">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mode of Transport
          </label>
          <div className="grid grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => handleTransportSelect('flight')}
              className={`flex flex-col items-center justify-center p-3 border rounded-md ${
                formData.transportMode === 'flight' ? 'bg-indigo-50 border-indigo-500' : 'border-gray-300'
              }`}
            >
              <Plane className={`h-6 w-6 ${formData.transportMode === 'flight' ? 'text-indigo-600' : 'text-gray-500'}`} />
              <span className="mt-1 text-xs">Flight</span>
            </button>

            <button
              type="button"
              onClick={() => handleTransportSelect('bus')}
              className={`flex flex-col items-center justify-center p-3 border rounded-md ${
                formData.transportMode === 'bus' ? 'bg-indigo-50 border-indigo-500' : 'border-gray-300'
              }`}
            >
              <Bus className={`h-6 w-6 ${formData.transportMode === 'bus' ? 'text-indigo-600' : 'text-gray-500'}`} />
              <span className="mt-1 text-xs">Bus</span>
            </button>

            <button
              type="button"
              onClick={() => handleTransportSelect('car')}
              className={`flex flex-col items-center justify-center p-3 border rounded-md ${
                formData.transportMode === 'car' ? 'bg-indigo-50 border-indigo-500' : 'border-gray-300'
              }`}
            >
              <Car className={`h-6 w-6 ${formData.transportMode === 'car' ? 'text-indigo-600' : 'text-gray-500'}`} />
              <span className="mt-1 text-xs">Car</span>
            </button>

            <button
              type="button"
              onClick={() => handleTransportSelect('bike')}
              className={`flex flex-col items-center justify-center p-3 border rounded-md ${
                formData.transportMode === 'bike' ? 'bg-indigo-50 border-indigo-500' : 'border-gray-300'
              }`}
            >
              <Bike className={`h-6 w-6 ${formData.transportMode === 'bike' ? 'text-indigo-600' : 'text-gray-500'}`} />
              <span className="mt-1 text-xs">Bike</span>
            </button>

            <button
              type="button"
              onClick={() => handleTransportSelect('train')}
              className={`flex flex-col items-center justify-center p-3 border rounded-md ${
                formData.transportMode === 'train' ? 'bg-indigo-50 border-indigo-500' : 'border-gray-300'
              }`}
            >
              <Train className={`h-6 w-6 ${formData.transportMode === 'train' ? 'text-indigo-600' : 'text-gray-500'}`} />
              <span className="mt-1 text-xs">Train</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe your trip..."
          />
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
         

          <div>
            <label htmlFor="activities" className="block text-sm font-medium text-gray-700 mb-1">
              Planned Activities
            </label>
            <textarea
              id="activities"
              name="activities"
              value={formData.activities}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Hiking, Beach, City Tour"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTrip;