'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(email, password);
            toast.success('Successfully logged in!');
            router.push('/');
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to log in. Please check your credentials.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            toast.success('Successfully logged in with Google!');
            router.push('/');
        } catch (error: any) {
            // ... error handling
            let errorMessage = 'Failed to log in with Google';
            if (error.code === 'auth/unauthorized-domain') {
                errorMessage = 'This domain is not authorized. Please use the official application URL.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup was blocked. Please allow popups for this site.';
            }
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left side - Form */}
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 bg-white">
                <div className="w-full max-w-sm mx-auto">
                    <Link href="/" className="text-2xl font-bold text-slate-900 tracking-tight mb-12 block">Explokar</Link>

                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                    <p className="text-slate-500 mb-8">
                        Please enter your details to sign in.
                    </p>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-start gap-2 text-sm">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-medium text-slate-900 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right side - Image */}
            <div className="hidden lg:block relative bg-slate-900">
                <img
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80"
                    alt="Travel"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                    <blockquote className="text-2xl font-medium leading-relaxed mb-4">
                        "Explokar helped me find the perfect travel buddies for my trip to Bali. Best experience ever!"
                    </blockquote>
                    <p className="font-bold">Sofia Davis</p>
                    <p className="text-slate-400">Travel Enthusiast</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
