import React from 'react';
import { Play, Star, TrendingUp } from 'lucide-react';
import logo from './src/assets/logo.jpeg';

const Home = () => {
  return (
    <div className="min-h-screen bg-cinemaBlack text-white">
      <nav className="p-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src={logo} alt="logo" className="w-10 h-10 rounded-full border border-brandRed" />
          <span className="font-black lowercase italic">filmybro</span>
        </div>
        <div className="flex gap-8 text-xs font-bold lowercase tracking-widest text-gray-400">
          <span className="text-brandBlue">feed</span>
          <span>discover</span>
          {/* <span>community</span> */}
        </div>
      </nav>
      
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-black lowercase mb-12 tracking-tighter">trending <span className="text-brandRed">now</span></h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[2/3] bg-white/5 rounded-[32px] border border-white/10 overflow-hidden group relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
              <div className="absolute bottom-6 left-6">
                <p className="text-xs font-bold text-brandBlue lowercase mb-1">sci-fi / action</p>
                <p className="text-xl font-black lowercase tracking-tight italic">cinematic masterpiece {i}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;