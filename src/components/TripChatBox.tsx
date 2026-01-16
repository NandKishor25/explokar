'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { ChatMessage } from '@/types';
import { format } from 'date-fns';

interface TripChatBoxProps {
    tripId: string;
    currentUser: {
        uid: string;
        displayName: string | null;
        photoURL: string | null;
    };
    compact?: boolean; // For inbox view
}

const TripChatBox: React.FC<TripChatBoxProps> = ({ tripId, currentUser, compact = false }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch messages
    const fetchMessages = async () => {
        try {
            const data = await chatService.getMessages(tripId, currentUser.uid);
            setMessages(data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching messages:', err);
            if (err.response?.status !== 403) {
                setError('Failed to load messages');
            }
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        fetchMessages();

        // Poll for new messages every 5 seconds
        const pollInterval = setInterval(fetchMessages, 5000);

        return () => clearInterval(pollInterval);
    }, [tripId, currentUser.uid]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle send message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || sending) return;

        try {
            setSending(true);
            const sentMessage = await chatService.sendMessage(tripId, currentUser.uid, {
                senderName: currentUser.displayName || 'User',
                senderPhoto: currentUser.photoURL || '',
                message: newMessage.trim()
            });

            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Format message time
    const formatTime = (dateString: string) => {
        try {
            return format(new Date(dateString), 'h:mm a');
        } catch {
            return '';
        }
    };

    // Format message date
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch {
            return '';
        }
    };

    // Check if we should show date separator
    const shouldShowDateSeparator = (currentMsg: ChatMessage, prevMsg: ChatMessage | null) => {
        if (!prevMsg) return true;
        const currentDate = new Date(currentMsg.createdAt).toDateString();
        const prevDate = new Date(prevMsg.createdAt).toDateString();
        return currentDate !== prevDate;
    };

    if (loading) {
        return (
            <div className={`bg-white ${compact ? '' : 'shadow rounded-lg'} p-6`}>
                {!compact && (
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-600" />
                        Trip Chat
                    </h2>
                )}
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white ${compact ? 'h-full flex flex-col' : 'shadow rounded-lg'} overflow-hidden`}>
            {/* Header */}
            {!compact && (
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Trip Chat
                    </h2>
                    <p className="text-indigo-200 text-sm">Chat with your fellow travelers</p>
                </div>
            )}

            {/* Messages Container */}
            <div
                ref={chatContainerRef}
                className={`${compact ? 'flex-1' : 'h-80'} overflow-y-auto p-4 bg-gray-50 space-y-3`}
            >
                {error && (
                    <div className="text-center text-red-500 text-sm py-2">
                        {error}
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageCircle className="w-12 h-12 mb-2" />
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isOwnMessage = msg.senderId === currentUser.uid;
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const showDateSeparator = shouldShowDateSeparator(msg, prevMsg);

                        return (
                            <React.Fragment key={msg._id}>
                                {/* Date Separator */}
                                {showDateSeparator && (
                                    <div className="flex items-center justify-center my-4">
                                        <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600">
                                            {formatDate(msg.createdAt)}
                                        </div>
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex items-end gap-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                                        {/* Avatar */}
                                        {!isOwnMessage && (
                                            <div className="flex-shrink-0">
                                                {msg.senderPhoto ? (
                                                    <img
                                                        src={msg.senderPhoto}
                                                        alt={msg.senderName}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                        {msg.senderName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Bubble */}
                                        <div className={`rounded-2xl px-4 py-2 ${isOwnMessage
                                                ? 'bg-indigo-600 text-white rounded-br-md'
                                                : 'bg-white text-gray-800 shadow-sm rounded-bl-md border border-gray-100'
                                            }`}>
                                            {/* Sender name (for others' messages) */}
                                            {!isOwnMessage && (
                                                <p className="text-xs font-medium text-indigo-600 mb-1">
                                                    {msg.senderName}
                                                </p>
                                            )}

                                            {/* Message text */}
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {msg.message}
                                            </p>

                                            {/* Time */}
                                            <p className={`text-xs mt-1 ${isOwnMessage ? 'text-indigo-200' : 'text-gray-400'
                                                }`}>
                                                {formatTime(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TripChatBox;
