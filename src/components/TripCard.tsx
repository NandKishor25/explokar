'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Users, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/trip/${trip._id}`;
    const shareData = {
      title: trip.title,
      text: `Check out this trip to ${trip.destination}!`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback if sharing fails specifically (e.g. user denied)
    }
  };

  return (
    <div className="relative group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100">
      <Link href={`/trip/${trip._id}`} className="block p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 pr-8 line-clamp-2">{trip.title}</h3>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-500" />
          <span className="truncate">{trip.destination}</span>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-500" />
          <span className="truncate">{formatDate(trip.startDate)} • {trip.duration} days</span>
        </div>

        <div className="flex items-center text-gray-600 mb-6">
          <Users className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-500" />
          <span>{trip.participants.length}/{trip.maxParticipants} travelers</span>
        </div>

        <div className="flex items-center pt-4 border-t border-gray-100">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0 ring-2 ring-gray-50">
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
          <span className="text-sm font-medium text-gray-700 truncate">By {trip.createdBy.name}</span>
        </div>
      </Link>

      <button
        onClick={handleShare}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all focus:outline-none"
        aria-label="Share trip"
        title="Share trip"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default TripCard;