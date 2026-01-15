'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Calendar, Users, DollarSign, Plane, Train, Car, Bus, Bike, MessageCircle } from 'lucide-react';
import { tripService } from '@/services/tripService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

import { Trip, Comment } from '@/types';
import ReviewModal from '@/components/ReviewModal';

const TripDetails = ({ params }: { params: { id: string } }) => {
    const { id } = params;
    const { currentUser } = useAuth();
    const router = useRouter();

    const [trip, setTrip] = useState<Trip | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);
    const [joinLoading, setJoinLoading] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState<{ uid: string; name: string } | null>(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [joinMessage, setJoinMessage] = useState('');

    useEffect(() => {
        const fetchTripDetails = async () => {
            try {
                setLoading(true);
                const tripData = await tripService.getTripById(id!);
                setTrip(tripData);

                // Fetch comments
                const commentsData = await tripService.getComments(id!);
                setComments(commentsData);
            } catch (error) {
                console.error('Error fetching trip details:', error);
                toast.error('Failed to load trip details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTripDetails();
        }
    }, [id]);



    const handleLeaveTrip = async () => {
        if (!currentUser) return;

        try {
            setJoinLoading(true);
            await tripService.leaveTrip(id!, {
                userId: currentUser.uid
            });

            // Update local state
            if (trip) {
                setTrip({
                    ...trip,
                    participants: trip.participants.filter(p => p.userId !== currentUser.uid)
                });
            }

            toast.success('Successfully left the trip');
        } catch (error) {
            console.error('Error leaving trip:', error);
            toast.error('Failed to leave trip');
        } finally {
            setJoinLoading(false);
        }
    };
    const handleDeleteTrip = async () => {
        if (!trip || !currentUser) return;

        if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
            return;
        }

        try {
            setLoading(true);
            await tripService.deleteTrip(id!);
            toast.success('Trip deleted successfully');
            router.push('/'); // Redirect to home
        } catch (error) {
            console.error('Error deleting trip:', error);
            toast.error('Failed to delete trip');
            setLoading(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error('You must be logged in to comment');
            return;
        }

        if (!newComment.trim()) return;

        try {
            setCommentLoading(true);
            const newCommentData = await tripService.addComment(id!, {
                userId: currentUser.uid,
                userName: currentUser.displayName || 'User',
                userPhoto: currentUser.photoURL || '',
                text: newComment
            });

            setComments([...comments, newCommentData]);
            setNewComment('');
            toast.success('Comment added');
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        } finally {
            setCommentLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Date not set';
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) return 'Invalid Date';
        try {
            return format(date, 'MMMM d, yyyy');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const isUserParticipant = () => {
        if (!currentUser || !trip) return false;
        return trip.participants.some(p => p.userId === currentUser.uid);
    };

    const isCreator = () => {
        if (!currentUser || !trip) return false;
        return trip.userId === currentUser.uid;
    };

    const getTransportIcon = () => {
        if (!trip) return null;

        switch (trip.transportMode) {
            case 'flight':
                return <Plane className="w-5 h-5 text-indigo-600" />;
            case 'train':
                return <Train className="w-5 h-5 text-indigo-600" />;
            case 'car':
                return <Car className="w-5 h-5 text-indigo-600" />;
            case 'bus':
                return <Bus className="w-5 h-5 text-indigo-600" />;
            case 'bike':
                return <Bike className="w-5 h-5 text-indigo-600" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h1>
                <Link href="/" className="text-indigo-600 hover:text-indigo-800">
                    Return to home page
                </Link>
            </div>
        );
    }




    const handleOpenJoinModal = () => {
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setIsJoinModalOpen(true);
    };

    const submitJoinRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            setJoinLoading(true);
            await tripService.joinTrip(id!, {
                userId: currentUser.uid,
                name: currentUser.displayName || 'User',
                photoURL: currentUser.photoURL || '',
                message: joinMessage
            });

            toast.success('Request sent successfully!');
            setIsJoinModalOpen(false);
            // Optionally update local state to show "Pending" but backend handles actual participant add
        } catch (error: any) {
            console.error('Error joining trip:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to send request';
            toast.error(errorMessage);
        } finally {
            setJoinLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Join Request Modal */}
            {isJoinModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Request to Join</h3>
                        <p className="text-gray-500 mb-4 text-sm">Send a message to the trip organizer introducing yourself.</p>

                        <form onSubmit={submitJoinRequest}>
                            <textarea
                                value={joinMessage}
                                onChange={(e) => setJoinMessage(e.target.value)}
                                placeholder="Hi! I'd love to join your trip because..."
                                className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
                                required
                            />
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsJoinModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={joinLoading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {joinLoading ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Trip Header */}
            <div className="relative h-96 rounded-xl overflow-hidden mb-8">
                <img
                    src={trip.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                    <h1 className="text-4xl font-bold text-white mb-2">{trip.title}</h1>
                    <div className="flex items-center text-white mb-4">
                        <MapPin className="w-5 h-5 mr-1" />
                        <span className="text-lg">{trip.startLocation} to {trip.destination}</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(trip.startDate)}</span>
                        </div>
                        <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                            <span>{trip.duration} days</span>
                        </div>
                        {trip.transportMode && (
                            <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                                {getTransportIcon()}
                                <span className="ml-1 capitalize">{trip.transportMode}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trip Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                                <p className="text-lg font-medium">{formatDate(trip.startDate)}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Duration</h3>
                                <p className="text-lg font-medium">{trip.duration} days</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">From</h3>
                                <p className="text-lg font-medium">{trip.startLocation}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">To</h3>
                                <p className="text-lg font-medium">{trip.destination}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Transport</h3>
                                <div className="flex items-center">
                                    {getTransportIcon()}
                                    <span className="ml-1 text-lg font-medium capitalize">{trip.transportMode}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Budget</h3>
                                <div className="flex items-center">
                                    <DollarSign className="w-5 h-5 text-indigo-600" />
                                    <span className="ml-1 text-lg font-medium">
                                        {trip.budget ? `$${trip.budget}` : 'Not specified'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Group Size</h3>
                                <div className="flex items-center">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                    <span className="ml-1 text-lg font-medium">
                                        {trip.participants.length} / {trip.maxParticipants + 1} travelers
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Preferred Gender</h3>
                                <p className="text-lg font-medium capitalize">{trip.preferredGender}</p>
                            </div>
                        </div>

                        {trip.activities && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Activities</h3>
                                <p className="text-lg">{trip.activities}</p>
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                            <p className="text-lg whitespace-pre-line">{trip.description}</p>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Comments</h2>

                        {currentUser ? (
                            <form onSubmit={handleAddComment} className="mb-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        {currentUser.photoURL ? (
                                            <img
                                                src={currentUser.photoURL}
                                                alt={currentUser.displayName || 'User'}
                                                className="h-10 w-10 rounded-full"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                                            <textarea
                                                rows={3}
                                                name="comment"
                                                id="comment"
                                                className="block w-full py-3 px-4 border-0 resize-none focus:ring-0 focus:outline-none sm:text-sm"
                                                placeholder="Add a comment..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                            />
                                            <div className="py-2 px-4 bg-gray-50 flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={commentLoading || !newComment.trim()}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                                >
                                                    {commentLoading ? 'Posting...' : 'Post'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                                <p className="text-gray-600 mb-2">You need to be logged in to comment</p>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Log in
                                </Link>
                            </div>
                        )}

                        {comments.length === 0 ? (
                            <div className="text-center py-6">
                                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Be the first to share your thoughts.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment._id} className="flex space-x-4">
                                        <div className="flex-shrink-0">
                                            {comment.userPhoto ? (
                                                <img
                                                    src={comment.userPhoto}
                                                    alt={comment.userName}
                                                    className="h-10 w-10 rounded-full"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                    {comment.userName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-gray-900">{comment.userName}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-700">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    {/* Trip Creator */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Organizer</h2>
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                                {trip.createdBy.photoURL ? (
                                    <img
                                        src={trip.createdBy.photoURL}
                                        alt={trip.createdBy.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {trip.createdBy.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">{trip.createdBy.name}</h3>
                            <p className="text-sm text-gray-500">{trip.createdBy.email}</p>
                        </div>
                    </div>
                    {/* Rate Organizer Button */}
                    {currentUser && currentUser.uid !== trip.userId && isUserParticipant() && (
                        <button
                            onClick={() => {
                                setSelectedParticipant({ uid: trip.userId, name: trip.createdBy.name });
                                setIsReviewModalOpen(true);
                            }}
                            className="mt-3 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium border border-indigo-100"
                        >
                            Rate Organizer
                        </button>
                    )}
                </div>

                {/* Participants */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Participants</h2>
                    <div className="space-y-4">
                        {/* Participants */}
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                                {trip.createdBy.photoURL ? (
                                    <img
                                        src={trip.createdBy.photoURL}
                                        alt={trip.createdBy.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {trip.createdBy.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{trip.createdBy.name}</p>
                                <p className="text-xs text-gray-500">Organizer</p>
                            </div>
                            {/* Rate Organizer Button */}
                            {currentUser && currentUser.uid !== trip.userId && isUserParticipant() && (
                                <button
                                    onClick={() => {
                                        setSelectedParticipant({ uid: trip.userId, name: trip.createdBy.name });
                                        setIsReviewModalOpen(true);
                                    }}
                                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                                >
                                    Rate
                                </button>
                            )}
                        </div>

                        {/* Other participants */}
                        {trip.participants.map((participant) => (
                            <div key={participant.userId} className="flex items-center">
                                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                                    {participant.photoURL ? (
                                        <img
                                            src={participant.photoURL}
                                            alt={participant.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {participant.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                                </div>
                                {/* Rate Participant Button */}
                                {currentUser && currentUser.uid !== participant.userId && isUserParticipant() && (
                                    <button
                                        onClick={() => {
                                            setSelectedParticipant({ uid: participant.userId, name: participant.name });
                                            setIsReviewModalOpen(true);
                                        }}
                                        className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                                    >
                                        Rate
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Empty slots */}
                        {Array.from({ length: trip.maxParticipants - trip.participants.length }).map((_, index) => (
                            <div key={index} className="flex items-center opacity-50">
                                <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-400">Available Spot</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Review Modal */}
                {selectedParticipant && currentUser && (
                    <ReviewModal
                        isOpen={isReviewModalOpen}
                        onClose={() => setIsReviewModalOpen(false)}
                        reviewerId={currentUser.uid}
                        revieweeId={selectedParticipant.uid}
                        revieweeName={selectedParticipant.name}
                        tripId={id!}
                    />
                )}

                <div className="bg-white shadow rounded-lg p-6">
                    {isUserParticipant() && (
                        <Link
                            href={`/trip/${id}/expenses`}
                            className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-3"
                        >
                            Manage Expenses
                        </Link>
                    )}
                    {!isCreator() && (
                        <>
                            {isUserParticipant() ? (
                                <button
                                    onClick={handleLeaveTrip}
                                    disabled={joinLoading}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {joinLoading ? 'Processing...' : 'Leave Trip'}
                                </button>
                            ) : trip.participants.length < trip.maxParticipants ? (
                                <button
                                    onClick={handleOpenJoinModal}
                                    disabled={joinLoading}
                                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {/* Handle text based on modal status or simple link if not logged in */}
                                    {!currentUser ? (
                                        'Login to Join'
                                    ) : (
                                        joinLoading ? 'Processing...' : 'Request to Join'
                                    )}
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
                                >
                                    Trip Full
                                </button>
                            )}
                        </>
                    )}

                    {/* Creator Actions */}
                    {isCreator() && (
                        <button
                            onClick={handleDeleteTrip}
                            className="w-full px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                            Delete Trip
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TripDetails;


