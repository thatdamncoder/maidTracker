"use client"
import { signIn } from 'next-auth/react';
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (type: 'google' | 'guest') => Promise<void>;
}

const Login = () => {
    const onLogin= (type: 'google' | 'guest') => signIn("google");
  const [loading, setLoading] = useState<'google' | 'guest' | null>(null);

  const handleAction = async (type: 'google' | 'guest') => {
    setLoading(type);
    try {
      await onLogin(type);
    } catch (e) {
      console.error(e);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl shadow-indigo-100 p-8 md:p-12 text-center animate-in zoom-in-95 duration-500">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-white mb-8 shadow-xl shadow-indigo-100 ring-8 ring-indigo-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-outfit font-black text-slate-900 mb-2">ServicePal</h1>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          The simplest way to track your home staff, milkman, and more.
        </p>

        <div className="space-y-4">
          <button 
            disabled={!!loading}
            onClick={() => handleAction('google')}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading === 'google' ? (
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.896,35.53,44,30.308,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
            )}
            {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-400 font-bold uppercase tracking-widest">Or</span>
            </div>
          </div>

          <button 
            disabled={!!loading}
            onClick={() => handleAction('guest')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading === 'guest' && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            {loading === 'guest' ? 'Entering...' : 'Try Guest Mode (5 min)'}
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-400 font-medium px-4">
          All data is securely synced to Supabase Cloud. Guest sessions expire automatically.
        </p>
      </div>
    </div>
  );
};

export default Login;
