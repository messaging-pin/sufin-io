import React, { useState, useEffect } from 'react';
import { FaPinterest } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const { user, signInWithGoogle, signInWithPassword, signUpWithPassword } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Automatically close and grant access as soon as user is verified & non-null
  useEffect(() => {
    if (user) {
      if (onSuccess) onSuccess();
    }
  }, [user, onSuccess]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMsg(error.message || 'Could not connect to Google.');
      setLoading(false);
    }
    // Browser redirects to Google OAuth
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        setLoading(false);
        return;
      }
      const { error } = await signUpWithPassword(email, password, fullName);
      if (error) {
        setErrorMsg(error.message || 'Sign up error.');
      }
    } else {
      const { error } = await signInWithPassword(email, password);
      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn font-sans">
      <div
        className="w-full max-w-[420px] bg-[#1a1a1f] border border-white/10 rounded-[32px] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden backdrop-blur-2xl animate-scaleUp text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-[#E60023]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Pinterest Logo */}
        <div className="w-14 h-14 rounded-full bg-[#E60023] flex items-center justify-center shadow-lg mb-4 mt-1">
          <FaPinterest className="w-9 h-9 text-white" />
        </div>

        {/* Header Text */}
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5">
          {mode === 'signin' ? 'Sign in to Messages' : 'Create an Account'}
        </h2>
        <p className="text-xs text-zinc-400 mb-5 max-w-[300px] leading-relaxed">
          Log in with your Google or email account to chat in real-time.
        </p>

        {errorMsg && (
          <div className="w-full mb-4 p-3 bg-red-500/15 border border-red-500/30 text-red-300 text-xs rounded-xl text-left">
            {errorMsg}
          </div>
        )}

        {/* Google OAuth Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-white hover:bg-zinc-100 disabled:opacity-60 text-zinc-900 font-semibold rounded-full flex items-center justify-center space-x-3 shadow-md hover:shadow-lg transition active:scale-98 cursor-pointer mb-3"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
          ) : (
            <FcGoogle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-[15px]">Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="w-full flex items-center my-2.5 text-xs text-zinc-500 uppercase tracking-widest font-semibold">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="px-3">or with email</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleAuthSubmit} className="w-full space-y-2.5">
          {mode === 'signup' && (
            <div className="relative">
              <UserIcon className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E60023] transition"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E60023] transition"
              required
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E60023] transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#E60023] hover:bg-[#ad081b] disabled:opacity-50 text-white font-semibold rounded-full text-sm transition active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer mt-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 w-full text-center text-xs text-zinc-400">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className="text-[#E60023] font-semibold hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className="text-[#E60023] font-semibold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
