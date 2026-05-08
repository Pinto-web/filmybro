import React from 'react';
import { Mail, Lock, ChevronRight } from 'lucide-react';
import logo from './src/assets/logo.jpeg';

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-cinemaBlack flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <img src={logo} alt="logo" className="w-16 h-16 rounded-full border-2 border-brandRed mb-4" />
          <h2 className="text-3xl font-black lowercase tracking-tighter italic">welcome back</h2>
        </div>
        <form className="space-y-6">
          <input type="email" placeholder="email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-brandBlue outline-none transition-all lowercase" />
          <input type="password" placeholder="password" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-brandRed outline-none transition-all lowercase" />
          <button className="w-full py-4 bg-brandRed text-white rounded-2xl font-black hover:scale-[1.02] transition-transform shadow-lg shadow-brandRed/20 lowercase">
            unleash the magic
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;