'use client';
import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setSubmitted(true);
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address');
            } else {
                setError('Could not send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-ice bg-grid-pattern flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
            {/* Decorative Glow Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-tech-blue/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-energetic-green/5 blur-[120px] pointer-events-none" />

            <main className="w-full max-w-[1000px] relative z-10">
                <div className="bg-white border-t-4 border-t-tech-blue border border-outline-variant/20 rounded-xl flex flex-col md:flex-row overflow-hidden shadow-login">
                    {/* Left Pane: Branding */}
                    <div className="md:w-5/12 bg-surface-container-low p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-outline-variant/20 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-1/4 translate-y-1/4">
                            <span className="material-symbols-outlined text-[200px]">hub</span>
                        </div>
                        <div className="realtive z-10">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-80 h-20 bg-void-navy rounded-lg flex items-center justify-center shadow-md">
                                    <span className="leading-tight text-[24px] text-white">ERP CRM</span>
                                </div>
                                <h1 className="font-headline font-bold text-void-navy text-[50px] leading-tight">ERP CRM Platfrom</h1>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Form */}
                    <div className="md:w-7/12 p-8 md:p-12 lg:p-16 flex items-center justify-center bg-white">
                        <div className="w-full max-w-md">
                            {!submitted ? (
                                <>
                                    <div className="mb-10">
                                        <h2 className="font-headline font-bold text-[28px] md:text-[32px] text-void-navy mb-2">Forgot Password?</h2>
                                        <p className="text-on-surface-variant text-[16px]">
                                            No worries, enter your email and we'll send you a reset link
                                        </p>
                                    </div>

                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        {/* Email */}
                                        <div>
                                            <label className="block font-label text-[12px] text-on-surface mb-2" htmlFor="email">
                                                Enter Your Email
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full h-12 pl-10 pr-4 bg-surface-container-low border border-outline-variant/40 rounded-lg text-[14px] text-on-surface focus:outline-none focus:border-tech-blue focus:ring-2 focus:ring-tech-blue/10 transition-all placeholder:text-outline"
                                                    placeholder="name@example.com"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {error && <p className="text-error text-[13px]">{error}</p>}

                                        {/* Submit */}
                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full h-12 bg-energetic-green hover:bg-[#00c250] text-white font-semibold text-[14px] rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-60"
                                            >
                                                {loading ? 'Sending...' : 'Send Reset Link'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center">
                                    <h2 className="font-headline font-bold text-[28px] md:text-[32px] text-void-navy mb-2">Check Your Email</h2>
                                    <p className="text-on-surface-variant text-[16px] mb-8">
                                        We've sent a password reset link to <span className="font-semibold text-on-surface">{email}</span>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setSubmitted(false)}
                                        className="text-[14px] text-tech-blue font-semibold hover:underline underline-offset-2"
                                    >
                                        Didn't receive it? Try again
                                    </button>
                                </div>
                            )}

                            <div className="mt-10 text-center border-t border-outline-variant/20 pt-6">
                                <p className="text-[14px] text-on-surface-variant">
                                    Remembered your password?{' '}
                                    <Link href="/login" className="text-tech-blue font-semibold ml-1 hover:underline underline-offset-2">
                                        Back to Login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}