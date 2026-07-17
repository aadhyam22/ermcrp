'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-ice bg-grid-pattern flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-tech-blue/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-energetic-green/5 blur-[120px] pointer-events-none" />

      <main className="w-full max-w-[1000px] relative z-10">
        <div className="bg-white border-t-4 border-t-tech-blue border border-outline-variant/20 rounded-xl flex flex-col md:flex-row overflow-hidden shadow-login">
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

          <div className="md:w-7/12 p-8 md:p-12 lg:p-16 flex items-center justify-center bg-white">
            <div className="w-full max-w-md">
              <div className="mb-10">
                <h2 className="font-headline font-bold text-[28px] md:text-[32px] text-void-navy mb-2">Welcome Back</h2>
                <p className="text-on-surface-variant text-[16px]">Please enter your details to login</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block font-label text-[12px] text-on-surface mb-2" htmlFor="email">
                    Enter Your Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="w-full h-12 pl-10 pr-4 bg-surface-container-low border border-outline-variant/40 rounded-lg text-[14px] text-on-surface focus:outline-none focus:border-tech-blue focus:ring-2 focus:ring-tech-blue/10 transition-all placeholder:text-outline"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-label text-[12px] text-on-surface" htmlFor="password">
                      Enter Password
                    </label>
                    <Link href="/forgot-password" className="font-label text-[12px] text-tech-blue hover:text-primary transition-colors hover:underline">Forgot Password?</Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className="w-full h-12 pl-10 pr-10 bg-surface-container-low border border-outline-variant/40 rounded-lg text-[14px] text-on-surface focus:outline-none focus:border-tech-blue focus:ring-2 focus:ring-tech-blue/10 transition-all placeholder:text-outline"
                      placeholder="••••••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[12px] hover:text-on-surface transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span>{showPassword ? 'hide' : 'show'}</span>
                    </button>
                  </div>
                </div>

                {error && <p className="text-error text-[13px]">{error}</p>}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-energetic-green hover:bg-[#00c250] text-white font-semibold text-[14px] rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>

              <div className="mt-10 text-center border-t border-outline-variant/20 pt-6">
                <p className="text-[14px] text-on-surface-variant">
                  Don't have an Account?{' '}
                  <Link href="/signup" className="text-tech-blue font-semibold ml-1 hover:underline underline-offset-2">Sign Up</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}