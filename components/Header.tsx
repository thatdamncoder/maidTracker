"use client"
import Link from "next/link";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function Header() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <header className="h-16 flex items-center px-4">
        <span className="text-sm text-slate-400">Loading...</span>
      </header>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between max-w-5xl">
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl md:rounded-2xl shadow-lg shadow-indigo-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="font-outfit font-extrabold text-lg md:text-2xl tracking-tight text-slate-900 hidden sm:block">ServicePal</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 bg-slate-50 p-1 rounded-xl md:rounded-2xl border border-slate-100">
            {user.image ? (
              <Image 
                src={user.image} 
                alt={user.name ?? "Anonymous"} 
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl object-cover"
                width={30}
                height={30}/>
            ) : (
              <div className="w-7 h-7 md:w-8 md:h-8 bg-indigo-100 rounded-lg md:rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xs">
                {user.name?.charAt(0) || 'U'}
              </div>
            )}
            <span className="text-xs font-bold text-slate-600 hidden md:block pr-1">{user.name}</span>
            <button 
              onClick={() => signOut()}
              className="p-1.5 hover:bg-white hover:text-rose-500 text-slate-400 rounded-lg transition-all"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

