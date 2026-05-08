import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Star, Flame, Info, X, Bookmark } from 'lucide-react';
import BroAudit from './BroAudit';
import DetailsModal from './DetailsModal';

const API_KEY = '2dc3d5ac442a4f699e4d84f3b7f9d507';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const RANK_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22d3ee'];

const TrendingPage = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [auditItem, setAuditItem] = useState(null);
  const [ratings, setRatings] = useState({});
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('filmybro_user'));
    const userId = user ? user._id : 'guest';
    const stored = JSON.parse(localStorage.getItem(`filmybro_ratings_${userId}`) || '{}');
    setRatings(stored);

    if (user && user.token) {
      axios.get('http://localhost:5000/api/users/watchlist', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => setWatchlist(res.data))
      .catch(err => console.error(err));
    }

    const fetchTrending = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/trending/all/day?api_key=${API_KEY}`);
        setTrending(res.data.results);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

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
    if (!user) return; // user can't use backlog if not logged in

    try {
      const res = await axios.post('http://localhost:5000/api/users/watchlist/toggle', 
        { movieId }, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setWatchlist(res.data.watchlist);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Loading Trends</span>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen pt-4 pb-16 px-6 relative z-20">
      {/* Page Header */}
      <div className="max-w-[1200px] mx-auto mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <TrendingUp className="text-red-500" size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-outfit font-black italic uppercase tracking-tighter drop-shadow-2xl">
            TRENDING <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">NOW</span>
          </h1>
        </div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">The most watched titles in the last 24 hours</p>
      </div>

      {/* Grid */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4 pb-20">
        {trending.map((item, idx) => {
          const myRating = ratings[item.id];
          const rankColor = RANK_COLORS[idx] || '#6b7280';

          return (
            <div key={item.id} className="group cursor-pointer flex flex-col">
              {/* Poster Container */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#0f0f13] transition-all duration-300 md:hover:border-red-600/60 shadow-[0_15px_40px_rgba(0,0,0,0.6)] md:hover:shadow-[0_0_40px_rgba(239,68,68,0.25)] md:hover:-translate-y-2">
                <img
                  src={item.poster_path ? `${IMG_PATH}${item.poster_path}` : 'https://via.placeholder.com/500x750'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt=""
                  onClick={() => setSelectedMovie(item)}
                />

                {/* Top-left rank number */}
                <div
                  className="absolute top-2 left-2 text-[11px] font-black px-2 py-1 rounded-lg backdrop-blur-sm"
                  style={{ background: `${rankColor}25`, color: rankColor, border: `1px solid ${rankColor}50` }}
                >
                  #{idx + 1}
                </div>

                {/* HOT badge for top 5 */}
                {idx < 5 && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md italic animate-pulse">
                    HOT
                  </div>
                )}
                
                {/* Watchlist Quick-Add button */}
                <button
                  onClick={(e) => toggleWatchlist(e, item.id)}
                  className={`absolute top-2 ${idx < 5 ? 'right-12' : 'right-2'} w-8 h-8 rounded-full flex items-center justify-center backdrop-blur transition-all z-10 ${
                    watchlist.includes(String(item.id)) 
                      ? 'bg-red-600 border border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                      : 'bg-black/60 border border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <Bookmark size={14} fill={watchlist.includes(String(item.id)) ? "currentColor" : "none"} />
                </button>

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-end pb-4 gap-2"
                  onClick={() => setSelectedMovie(item)}
                >
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedMovie(item); }}
                    className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full border border-white/20 transition-all"
                  >
                    <Info size={10} /> Details
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setAuditItem(item); }}
                    className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full transition-all shadow-lg shadow-red-600/30"
                  >
                    <Flame size={10} /> Rate
                  </button>
                </div>

                {/* User rating badge */}
                {myRating && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur border border-red-600/50 rounded-lg px-2 py-1">
                    <Flame size={9} fill="#ef4444" className="text-red-500" />
                    <span className="text-[9px] font-black text-white">{myRating}</span>
                  </div>
                )}
              </div>

              {/* Title and Rating */}
              <div className="mt-2 px-1">
                <h3 className="text-[9px] font-outfit font-black uppercase truncate italic text-white/80 group-hover:text-white transition-colors">
                  {item.title || item.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star size={11} fill="#fbbf24" className="text-[#fbbf24]" />
                  <span className="text-[11px] font-black text-[#fbbf24] tracking-tighter">
                    {item.vote_average?.toFixed(1)}
                  </span>
                  {myRating && (
                    <span className="ml-auto text-[9px] font-black text-red-500 flex items-center gap-0.5">
                      <Flame size={9} fill="currentColor" />{myRating}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DetailsModal
        selectedMovie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onRateClick={(movie) => { setSelectedMovie(null); setAuditItem(movie); }}
      />

      {auditItem && <BroAudit movie={auditItem} onClose={handleAuditClose} />}
    </div>
  );
};

export default TrendingPage;