import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface TripCardProps {
  trip: {
    _id: string;
    title: string;
    destination: string;
    startDate: string;
    duration: number;
    maxParticipants: number;
    participants: any[];
    imageUrl: string;
    createdBy: {
      name: string;
      photoURL: string;
    };
  };
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <Link 
      to={`/trip/${trip._id}`}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
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
          <span>{trip.destination}</span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{formatDate(trip.startDate)} • {trip.duration} days</span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-4">
          <Users className="w-4 h-4 mr-1" />
          <span>{trip.participants.length}/{trip.maxParticipants + 1} travelers</span>
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
          <span className="text-sm text-gray-600">By {trip.createdBy.name}</span>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;