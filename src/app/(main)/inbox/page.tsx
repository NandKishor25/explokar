'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle, Users, ArrowLeft } from 'lucide-react';
import { chatService } from '@/services/chatService';
import TripChatBox from '@/components/TripChatBox';
import { formatDistanceToNow } from 'date-fns';

interface TripChat {
    _id: string;
    title: string;
    destination: string;
    imageUrl?: string;
    createdBy: {
        name: string;
        photoURL: string;
    };
    participants: { userId: string; name: string; photoURL?: string }[];
    isCreator: boolean;
    lastMessage: {
        message: string;
        senderName: string;
        createdAt: string;
    } | null;
    messageCount: number;
}

const InboxPage = () => {
    const { currentUser } = useAuth();
    const router = useRouter();

    const [chats, setChats] = useState<TripChat[]>([]);
    const [selectedChat, setSelectedChat] = useState<TripChat | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user's chats
    useEffect(() => {
        const fetchChats = async () => {
            if (!currentUser) return;

            try {
                setLoading(true);
                const data = await chatService.getUserChats(currentUser.uid);
                setChats(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching chats:', err);
                setError('Failed to load chats');
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [currentUser]);

    // Redirect if not logged in
    useEffect(() => {
        if (!currentUser && !loading) {
            router.push('/login');
        }
    }, [currentUser, loading, router]);

    // Format last message time
    const formatTime = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return '';
        }
    };

    // Truncate message
    const truncateMessage = (message: string, maxLength: number = 40) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    if (!currentUser) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-indigo-600" />
                Inbox
            </h1>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : chats.length === 0 ? (
                <div className="text-center py-16">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">No chats yet</h2>
                    <p className="text-gray-500 mb-6">Join or create a trip to start chatting with other travelers!</p>
                    <button
                        onClick={() => router.push('/create-trip')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Create a Trip
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat List */}
                    <div className={`lg:col-span-1 ${selectedChat ? 'hidden lg:block' : ''}`}>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                                <h2 className="text-lg font-bold text-white">Your Trip Chats</h2>
                                <p className="text-indigo-200 text-sm">{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[calc(100vh-16rem)] overflow-y-auto">
                                {chats.map((chat) => (
                                    <div
                                        key={chat._id}
                                        onClick={() => setSelectedChat(chat)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat?._id === chat._id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Trip Image */}
                                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                                {chat.imageUrl ? (
                                                    <img
                                                        src={chat.imageUrl}
                                                        alt={chat.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-bold">
                                                        {chat.title.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {chat.title}
                                                    </h3>
                                                    {chat.lastMessage && (
                                                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                                            {formatTime(chat.lastMessage.createdAt)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {chat.destination} • {chat.participants.length + 1} members
                                                </p>
                                                {chat.lastMessage ? (
                                                    <p className="text-sm text-gray-600 truncate">
                                                        <span className="font-medium">{chat.lastMessage.senderName}:</span>{' '}
                                                        {truncateMessage(chat.lastMessage.message)}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No messages yet</p>
                                                )}
                                            </div>

                                            {/* Badge */}
                                            {chat.isCreator && (
                                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full h-fit">
                                                    Creator
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chat View */}
                    <div className={`lg:col-span-2 ${!selectedChat ? 'hidden lg:block' : ''}`}>
                        {selectedChat ? (
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[calc(100vh-12rem)]">
                                {/* Chat Header */}
                                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center gap-4">
                                    {/* Back button (mobile) */}
                                    <button
                                        onClick={() => setSelectedChat(null)}
                                        className="lg:hidden p-1 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-white" />
                                    </button>

                                    {/* Trip Image */}
                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 border-white/30">
                                        {selectedChat.imageUrl ? (
                                            <img
                                                src={selectedChat.imageUrl}
                                                alt={selectedChat.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-400 text-white font-bold">
                                                {selectedChat.title.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-lg font-bold text-white">{selectedChat.title}</h2>
                                        <div className="flex items-center gap-2 text-indigo-200 text-sm">
                                            <Users className="w-4 h-4" />
                                            <span>{selectedChat.participants.length + 1} members</span>
                                            <span>•</span>
                                            <span>{selectedChat.destination}</span>
                                        </div>
                                    </div>

                                    {/* View Trip Button */}
                                    <button
                                        onClick={() => router.push(`/trip/${selectedChat._id}`)}
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors"
                                    >
                                        View Trip
                                    </button>
                                </div>

                                {/* Chat Content */}
                                <div className="h-[calc(100%-5rem)]">
                                    <TripChatBox
                                        tripId={selectedChat._id}
                                        currentUser={{
                                            uid: currentUser.uid,
                                            displayName: currentUser.displayName,
                                            photoURL: currentUser.photoURL
                                        }}
                                        compact={true}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-gray-400">
                                <MessageCircle className="w-16 h-16 mb-4" />
                                <p className="text-lg font-medium">Select a chat to start messaging</p>
                                <p className="text-sm">Choose from your trip chats on the left</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InboxPage;
