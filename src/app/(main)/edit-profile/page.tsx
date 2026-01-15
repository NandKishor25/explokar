'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { User, Camera, ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function EditProfile() {
    const { currentUser, updateUserProfile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        displayName: '',
        photoURL: '',
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                displayName: currentUser.displayName || '',
                photoURL: currentUser.photoURL || '',
            });
            setImagePreview(currentUser.photoURL);
        }
    }, [currentUser]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
            toast.error('Only JPEG, PNG, GIF, and WEBP files are allowed.');
            return;
        }

        if (file.size > maxSize) {
            toast.error('File size must be less than 5MB.');
            return;
        }

        // Local Preview
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const data = new FormData();
            data.append('image', file);

            // Note: Using relative path for Next.js API route
            const response = await axios.post('/api/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setFormData(prev => ({ ...prev, photoURL: response.data.url }));
            toast.success('Image uploaded!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
            setImagePreview(currentUser?.photoURL || null);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.displayName.trim()) {
            toast.error("Display name can't be empty");
            return;
        }

        setLoading(true);
        try {
            await updateUserProfile(formData);
            toast.success('Profile updated successfully');
            router.push('/profile');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full">
                    <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <User className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
                    <p className="text-gray-500 mt-2">Please log in to edit your profile settings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
            <div className="max-w-xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/profile')}
                    className="group mb-8 flex items-center text-gray-500 hover:text-indigo-600 transition-colors font-medium"
                >
                    <div className="p-2 bg-white rounded-xl shadow-sm mr-3 group-hover:bg-indigo-50 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    Back to Profile
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                    {/* Header Accent */}
                    <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    </div>

                    <div className="px-8 pb-10">
                        <form onSubmit={handleSubmit} className="relative -mt-16">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center mb-10">
                                <div className="relative group">
                                    <div
                                        onClick={handleImageClick}
                                        className="w-32 h-32 rounded-[2.5rem] border-[6px] border-white overflow-hidden bg-gray-100 shadow-2xl cursor-pointer relative"
                                    >
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className={`w-full h-full object-cover transition-all duration-500 ${uploading ? 'opacity-40 blur-[2px]' : 'group-hover:scale-110'}`}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-400">
                                                <User className="w-12 h-12" />
                                            </div>
                                        )}

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                            <Camera className="text-white w-8 h-8" />
                                        </div>

                                        {/* Loading Spinner for Image */}
                                        {uploading && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
                                        <div className="bg-indigo-600 p-1.5 rounded-xl">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <h2 className="mt-4 text-2xl font-black text-gray-900 tracking-tight">Personal Info</h2>
                                <p className="text-gray-500 text-sm">Update your identity across the platform</p>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="relative">
                                    <label htmlFor="displayName" className="block text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 ml-1">
                                        Display Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="displayName"
                                            name="displayName"
                                            placeholder="e.g. Alex Traveler"
                                            value={formData.displayName}
                                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                            className="block w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all text-gray-900 font-medium placeholder:text-gray-400"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                                            <User className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/profile')}
                                        className="flex-1 px-6 py-4 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || uploading}
                                        className="flex-[2] relative overflow-hidden group bg-indigo-600 px-6 py-4 rounded-2xl text-sm font-bold text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70 transition-all"
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-2">
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Saving Changes...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-5 h-5 transition-transform group-hover:scale-110" />
                                                    <span>Save Settings</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Security Tip */}
                <div className="mt-8 bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex items-start gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-indigo-900">Quick Tip</p>
                        <p className="text-xs text-indigo-700/70 mt-0.5">Using a real name helps your travel buddies recognize you more easily during trip planning.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
