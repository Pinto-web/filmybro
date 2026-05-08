import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Star, X, Search, Zap, Flame, Crown, Tv, DollarSign, BotMessageSquare, Info, Film, Filter, Bookmark } from 'lucide-react';

import { toast } from 'react-hot-toast';

const API_KEY = '2dc3d5ac442a4f699e4d84f3b7f9d507';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

import BroAudit from './BroAudit';
import DetailsModal from './DetailsModal';
import RevenueBadge from './RevenueBadge';

const MoviesPage = () => {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [auditItem, setAuditItem] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [ratings, setRatings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all'); // all, high, low
  const [filterYear, setFilterYear] = useState('all'); // all, new, old
  const [watchlist, setWatchlist] = useState([]);

  // Load stored ratings and watchlist on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('filmybro_user'));
    const userId = user ? user._id : 'guest';
    const stored = JSON.parse(localStorage.getItem(`filmybro_ratings_${userId}`) || '{}');
    setRatings(stored);

    if (user && user.token) {
      axios.get('/api/users/watchlist', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => setWatchlist(res.data))
      .catch(err => console.error('Watchlist fetch error', err));
    }
  }, []);

  // Refresh ratings when audit modal closes
  const handleAuditClose = () => {
    setAuditItem(null);
    const user = JSON.parse(localStorage.getItem('filmybro_user'));
    const userId = user ? user._id : 'guest';
    const stored = JSON.parse(localStorage.getItem(`filmybro_ratings_${userId}`) || '{}');
    setRatings(stored);
  };

  const toggleWatchlist = async (e, movieId) => {
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem('filmybro_user'));
    if (!user) {
      toast.error('Log in to use The Backlog');
      return;
    }

    try {
      const res = await axios.post('/api/users/watchlist/toggle', 
        { movieId }, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setWatchlist(res.data.watchlist);
      if (res.data.added) toast.success('Added to Backlog');
      else toast('Removed from Backlog', { icon: '🗑️' });
    } catch (err) {
      toast.error('Failed to update Backlog');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let endpoint;
      let isBrocommends = false;

      if (searchQuery.trim() !== '') {
        endpoint = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`;
      } else if (category === 'brocommends') {
        isBrocommends = true;
        const topRatedKeys = Object.keys(ratings).filter(id => ratings[id] >= 8);
        if (topRatedKeys.length > 0) {
          const randomId = topRatedKeys[Math.floor(Math.random() * topRatedKeys.length)];
          endpoint = `${BASE_URL}/movie/${randomId}/recommendations?api_key=${API_KEY}`;
        } else {
          endpoint = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
        }
      } else {
        switch (category) {
          case 'top_rated': endpoint = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`; break;
          case 'tv': endpoint = `${BASE_URL}/tv/popular?api_key=${API_KEY}`; break;
          case 'grossing': endpoint = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=revenue.desc`; break;
          default: endpoint = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
        }
      }

      try {
        const res = await axios.get(endpoint);
        let results = res.data.results.filter(item => item.poster_path).slice(0, 40);
        if (isBrocommends && Object.keys(ratings).filter(id => ratings[id] >= 8).length === 0) {
          toast('Rate a movie 8+ to get personalized Brocommends!', { icon: '🤖', id: 'bro-toast' });
        }
        setItems(results);
      } catch (err) { 
        console.error("Fetch error:", err);
        toast.error('Failed to connect to TMDB Vault');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [category, searchQuery, ratings]);

  const processedItems = useMemo(() => {
    return items.filter(i => {
      const year = parseInt((i.release_date || i.first_air_date || '0').substring(0, 4));
      if (filterYear === 'new') return year >= 2020;
      if (filterYear === 'old') return year > 0 && year < 2020;
      return true;
    }).sort((a, b) => {
      if (filterRating === 'high') return (b.vote_average || 0) - (a.vote_average || 0);
      if (filterRating === 'low') return (a.vote_average || 0) - (b.vote_average || 0);
      return 0;
    });
  }, [items, filterYear, filterRating]);

  return (
    <div className="w-full min-h-screen pt-4 pb-16 px-8 relative z-20">

      {/* SEARCH SECTION */}
      <div className="max-w-[1500px] mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <BotMessageSquare className="text-red-500" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-outfit font-black italic uppercase tracking-tighter drop-shadow-2xl">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">VAULT</span>
          </h1>
        </div>
        <div className="relative w-full max-w-md group">
          <input
            type="text"
            placeholder="FIND YOUR NEXT WATCH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-6 rounded-2xl text-[10px] font-outfit font-black tracking-widest outline-none focus:border-red-600/50 transition-all placeholder:text-zinc-600 focus:bg-white/10 shadow-inner"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={16} />
        </div>
      </div>

      {/* CATEGORY OPTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 border-b border-white/5 pb-10 gap-8">
        <div className="flex flex-wrap justify-center gap-4 bg-[#070709]/50 p-2 rounded-full border border-white/5 backdrop-blur-md shadow-2xl relative z-20">
          {[
            { id: 'popular', label: 'POPULAR', icon: Zap, color: 'text-red-500', shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]', bg: 'bg-red-600/20 border-red-500/50' },
            { id: 'brocommends', label: 'BROCOMMENDS', icon: Flame, color: 'text-purple-400', shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]', bg: 'bg-purple-600/20 border-purple-500/50' },
            { id: 'top_rated', label: 'HIGHEST RATED', icon: Crown, color: 'text-yellow-500', shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]', bg: 'bg-yellow-600/20 border-yellow-500/50' },
            { id: 'tv', label: 'TV SERIES', icon: Tv, color: 'text-blue-400', shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]', bg: 'bg-blue-600/20 border-blue-500/50' },
            { id: 'grossing', label: 'HIGHEST GROSSING', icon: DollarSign, color: 'text-green-400', shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]', bg: 'bg-green-600/20 border-green-500/50' }
          ].map((t) => {
            const isActive = category === t.id && !searchQuery;
            return (
              <button
                key={t.id}
                onClick={() => { setCategory(t.id); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 border border-transparent ${
                  isActive 
                    ? `${t.bg} ${t.color} ${t.shadow} scale-105` 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <t.icon size={14} fill={isActive ? 'currentColor' : 'none'} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
           <Filter size={14} className="text-zinc-500" />
           <select className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-zinc-400 focus:text-white cursor-pointer" value={filterRating} onChange={e => setFilterRating(e.target.value)}>
             <option value="all" className="bg-black">All Ratings</option>
             <option value="high" className="bg-black">Highest Rated First</option>
             <option value="low" className="bg-black">Lowest Rated First</option>
           </select>
           <div className="w-px h-4 bg-white/10 mx-2"></div>
           <select className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-zinc-400 focus:text-white cursor-pointer" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
             <option value="all" className="bg-black">Any Era</option>
             <option value="new" className="bg-black">Modern (2020+)</option>
             <option value="old" className="bg-black">Classics (&lt; 2020)</option>
           </select>
        </div>
      </div>

      {/* 10-COLUMN GRID */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-5 max-w-[1500px] mx-auto">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl border border-red-600/10 bg-[#070709] shadow-[0_0_20px_rgba(239,68,68,0.05)] overflow-hidden relative">
              <div className="absolute inset-0 block bg-gradient-to-r from-transparent via-red-600/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          ))}
        </div>
      ) : processedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-50">
           <Film size={64} className="text-zinc-700 mb-6" />
           <p className="text-2xl font-black italic uppercase tracking-widest text-zinc-500">The Vault is Empty</p>
           <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-5 max-w-[1500px] mx-auto">
          {processedItems.map(item => {
            const myRating = ratings[item.id];
          return (
            <div key={item.id} className="group flex flex-col transform transition-transform duration-500 md:hover:scale-[1.03]">
              {/* Poster */}
              <div
                className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-[#0f0f13] transition-all duration-300 md:hover:border-red-600/60 shadow-[0_15px_40px_rgba(0,0,0,0.6)] md:hover:shadow-[0_0_40px_rgba(239,68,68,0.25)] md:hover:-translate-y-2 cursor-pointer"
                onClick={() => setSelectedMovie(item)}
              >
                <img src={`${IMG_PATH}${item.poster_path}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-end pb-4 gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedMovie(item); }}
                    className="flex items-center gap-1 bg-white/15 hover:bg-white/25 backdrop-blur text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full border border-white/20 transition-all"
                  >
                    <Info size={10} /> Details
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setAuditItem(item); }}
                    className="flex items-center gap-1 bg-red-600/90 hover:bg-red-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full transition-all shadow-lg shadow-red-600/30"
                  >
                    <Flame size={10} /> Rate
                  </button>
                </div>
                
                {/* Watchlist Quick-Add button (Top Right) */}
                <button
                  onClick={(e) => toggleWatchlist(e, item.id)}
                  className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur transition-all ${
                    watchlist.includes(String(item.id)) 
                      ? 'bg-red-600 border border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                      : 'bg-black/60 border border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <Bookmark size={14} fill={watchlist.includes(String(item.id)) ? "currentColor" : "none"} />
                </button>

                {/* User rating badge */}
                {myRating && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/75 backdrop-blur border border-red-600/50 rounded-lg px-2 py-1">
                    <Flame size={9} fill="#ef4444" className="text-red-500" />
                    <span className="text-[9px] font-black text-white">{myRating}</span>
                  </div>
                )}
              </div>

              {/* Below poster info */}
              <div className="mt-3 px-1">
                <h3 className="text-[10px] font-outfit font-black uppercase italic text-zinc-400 group-hover:text-white transition-colors line-clamp-2 tracking-tight mb-1">{item.title || item.name}</h3>
                <div className="flex items-center gap-2">
                  <Star size={12} fill="#ef4444" className="text-red-500" />
                  <span className="text-[12px] font-black text-white tracking-tighter">
                    {item.vote_average ? item.vote_average.toFixed(1) : '0.0'}
                  </span>
                  {myRating && (
                    <span className="ml-auto text-[9px] font-black text-red-500 flex items-center gap-0.5">
                      <Flame size={9} fill="currentColor" />{myRating}
                    </span>
                  )}
                </div>
                {category === 'grossing' && <RevenueBadge movieId={item.id} />}
              </div>
            </div>
          );
        })}
      </div>
      )}

      <DetailsModal
        selectedMovie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onRateClick={(movie) => { setSelectedMovie(null); setAuditItem(movie); }}
      />
      {auditItem && <BroAudit movie={auditItem} onClose={handleAuditClose} />}
    </div>
  );
};

export default MoviesPage;