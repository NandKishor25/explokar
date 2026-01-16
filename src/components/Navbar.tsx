'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Compass, Search, User, LogOut, Menu, X, Bell, MessageCircle } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import RequestDetailsModal from './RequestDetailsModal';

const Navbar = () => {
  const { currentUser, logout, loading } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleRequestAction = async (requestId: string, status: 'accepted' | 'rejected', notificationId: string) => {
    try {
      if (!currentUser) return;

      await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.uid
        },
        body: JSON.stringify({ status })
      });

      // Mark notification as read
      await markAsRead(notificationId);
      // Refresh notifications not strictly needed if we assume optimistic update or re-fetch on mount, but good habit
    } catch (error) {
      console.error('Error handling request:', error);
    }
  };

  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <span className="text-2xl font-serif font-bold text-stone-900">Explokar</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Compass className="h-8 w-8 text-blue-500" strokeWidth={2.5} />
              <span className="text-2xl font-bold text-slate-800 tracking-tight">Explokar</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/my-trips" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              My Trips
            </Link>
            <Link href="/create-trip" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Create Trip
            </Link>
            {currentUser && (
              <Link href="/inbox" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                Inbox
              </Link>
            )}

            {currentUser && (
              <div className="relative group mr-4">
                <button className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors">
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border border-white text-[10px] flex items-center justify-center text-white font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={() => markAllAsRead()} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => {
                            if (notif.type === 'JOIN_REQUEST' && notif.relatedId) {
                              setSelectedRequestId(notif.relatedId);
                              setIsModalOpen(true);
                              markAsRead(notif._id);
                            }
                          }}
                          className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                              {notif.sender.photoURL ? (
                                <img src={notif.sender.photoURL} alt={notif.sender.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-full h-full p-1.5 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-slate-800 leading-snug">{notif.message}</p>
                              <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>

                              {notif.type === 'JOIN_REQUEST' && notif.relatedId && (
                                <p className="text-xs text-blue-600 mt-1">Click to view details</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Request Details Modal */}
            {currentUser && (
              <RequestDetailsModal
                isOpen={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setSelectedRequestId(null);
                }}
                requestId={selectedRequestId || ''}
                currentUserId={currentUser.uid}
                onAction={() => {
                  refreshNotifications();
                }}
              />
            )}

            {currentUser ? (
              <div className="relative group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-2 text-slate-400" />
                  )}
                </div>
                {/* Dropdown could go here */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-2 space-y-1">
                    <Link href="/profile" className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Profile</Link>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-stone-900 border-b border-white/10">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link
              href="/"
              className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/search"
              className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Destinations
            </Link>

            {currentUser ? (
              <>
                <Link
                  href="/create-trip"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Plan a Trip
                </Link>
                <Link
                  href="/my-trips"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Trips
                </Link>
                <Link
                  href="/inbox"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inbox
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-500 hover:bg-white/5"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="pt-4 border-t border-white/10 mt-2"></div>
                <Link
                  href="/login"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;