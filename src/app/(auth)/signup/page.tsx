'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Mail, Lock, CheckCircle2, UserPlus } from 'lucide-react';
import { registerUser, loginUser } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create User
      await registerUser(email, password);
      
      // 2. Auto-Login right after creating account
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      const data = await loginUser(formData);
      localStorage.setItem('access_token', data.access_token);
      
      // 3. Trigger Transition
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create account. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden font-sans p-6">
      
      {/* ANIMATED BACKGROUND ORBS */}
      <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-fuchsia-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-pulse duration-1000"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

      {/* SUCCESS OVERLAY WIPE */}
      <div className={`absolute inset-0 bg-fuchsia-600 z-50 flex items-center justify-center transition-transform duration-1000 ease-in-out ${success ? 'translate-y-0' : 'translate-y-full'}`}>
         <div className="text-white flex flex-col items-center">
            <UserPlus className="w-16 h-16 animate-pulse mb-4" />
            <h2 className="text-3xl font-black tracking-widest uppercase">Account Created</h2>
         </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="bg-gradient-to-br from-fuchsia-500 to-indigo-500 p-3 rounded-2xl shadow-lg shadow-fuchsia-500/20 mb-4 transform transition-transform hover:scale-110">
            <Activity className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Create an Account</h2>
          <p className="text-gray-400 font-medium text-sm text-center">
            Start tracking your subscriptions and saving money today.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <form className="space-y-6 relative z-10" onSubmit={handleSignup}>
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-fuchsia-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 text-white placeholder-gray-600 outline-none transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-fuchsia-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 text-white placeholder-gray-600 outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-fuchsia-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 text-white placeholder-gray-600 outline-none transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl text-sm font-black transition-all duration-300 shadow-[0_0_20px_rgba(217,70,239,0.2)] disabled:opacity-80
                ${success ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02]'}
              `}
            >
              {success ? (
                <><CheckCircle2 className="w-5 h-5 animate-pulse" /><span>Authenticated</span></>
              ) : isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><UserPlus className="w-4 h-4" /><span>Sign Up</span></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center relative z-10">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}