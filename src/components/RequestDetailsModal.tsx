'use client';

import React, { useState, useEffect } from 'react';
import { X, User, ExternalLink, Check, XCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface RequestDetails {
    request: {
        _id: string;
        tripId: string;
        userId: string;
        userName: string;
        userPhoto: string;
        status: string;
        message: string;
        createdAt: string;
    };
    trip: {
        _id: string;
        title: string;
        destination: string;
        imageUrl: string;
    };
}

interface RequestDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestId: string;
    currentUserId: string;
    onAction?: (action: 'accepted' | 'rejected') => void;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
    isOpen,
    onClose,
    requestId,
    currentUserId,
    onAction
}) => {
    const [details, setDetails] = useState<RequestDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (isOpen && requestId) {
            fetchDetails();
        }
    }, [isOpen, requestId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/requests/${requestId}`, {
                headers: {
                    'x-user-id': currentUserId
                }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setDetails(data);
        } catch (error) {
            console.error('Error fetching request details:', error);
            toast.error('Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (status: 'accepted' | 'rejected') => {
        if (!details) return;

        try {
            setActionLoading(true);
            const res = await fetch(`/api/requests/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': currentUserId
                },
                body: JSON.stringify({ status })
            });

            if (!res.ok) throw new Error('Failed to update');

            toast.success(`Request ${status}`);
            onAction?.(status);
            onClose();
        } catch (error) {
            console.error('Error updating request:', error);
            toast.error('Failed to process request');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all animate-in fade-in zoom-in-95"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Join Request</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : details ? (
                        <div className="space-y-6">
                            {/* Trip Info */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={details.trip.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=200&q=80'}
                                        alt={details.trip.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Request to join</p>
                                    <Link href={`/trip/${details.trip._id}`} className="font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                                        {details.trip.title}
                                    </Link>
                                    <p className="text-sm text-gray-500">{details.trip.destination}</p>
                                </div>
                            </div>

                            {/* Requester Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-md">
                                    {details.request.userPhoto ? (
                                        <img
                                            src={details.request.userPhoto}
                                            alt={details.request.userName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                                            <User className="w-6 h-6 text-indigo-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-900">{details.request.userName}</span>
                                        <Link
                                            href={`/user/${details.request.userId}`}
                                            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                        >
                                            View Profile <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3">{formatDate(details.request.createdAt)}</p>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                                <p className="text-sm font-medium text-gray-500 mb-2">Message</p>
                                <p className="text-gray-800 leading-relaxed">{details.request.message}</p>
                            </div>

                            {/* Status Badge */}
                            {details.request.status !== 'pending' && (
                                <div className={`text-center py-2 rounded-lg text-sm font-medium ${details.request.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    This request has been {details.request.status}
                                </div>
                            )}

                            {/* Action Buttons */}
                            {details.request.status === 'pending' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAction('rejected')}
                                        disabled={actionLoading}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => handleAction('accepted')}
                                        disabled={actionLoading}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        <Check className="w-5 h-5" />
                                        Accept
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Failed to load request details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestDetailsModal;
