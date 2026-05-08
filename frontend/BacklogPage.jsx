import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark, Star, Flame, Info, Check, Dices } from 'lucide-react';
import BroAudit from './BroAudit';
import DetailsModal from './DetailsModal';
import { toast } from 'react-hot-toast';

const API_KEY = '2dc3d5ac442a4f699e4d84f3b7f9d507';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const BacklogPage = () => {
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [auditItem, setAuditItem] = useState(null);
  const [ratings, setRatings] = useState({});
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('filmybro_user'));
    const userId = user ? user._id : 'guest';
    const stored = JSON.parse(localStorage.getItem(`filmybro_ratings_${userId}`) || '{}');
    setRatings(stored);

    const fetchBacklog = async () => {
      try {
        if (!user || !user.token) {
          setLoading(false);
          return;
        }
        
        // 1. Get raw watchlist IDs
        const idsRes = await axios.get('/api/users/watchlist', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        const ids = idsRes.data || [];
        setWatchlistIds(ids);

        // 2. Fetch full movie details for each ID
        if (ids.length > 0) {
          const detailPromises = ids.map(id => 
            axios.get(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`)
                 .catch(() => axios.get(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`))
                 .catch(() => null)
          );
          
          const detailsArray = await Promise.all(detailPromises);
          const validMovies = detailsArray.filter(res => res && res.data).map(res => res.data);
          setMovies(validMovies.reverse()); // latest added at top
        }
        
      } catch (err) {
        console.error("Backlog Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBacklog();
  }, []);

  const handleAuditClose = () => {
    setAuditItem(null);
    const user = JSON.parse(localStorage.getItem('filmybro_user'));
    const userId = user ? user._id : 'guest';
    const stored = JSON.parse(localStorage.getItem(`filmybro_ratings_${userId}`) || '{}');
    setRatings(stored);
  };

  const removeFromBacklog = async (e, movieId) => {
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem('filmybro_user'));
    if (!user) return;

    try {
      const res = await axios.post('/api/users/watchlist/toggle', 
        { movieId }, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setWatchlistIds(res.data.watchlist);
      setMovies(prev => prev.filter(m => String(m.id) !== String(movieId)));
      toast('Removed from Backlog', { icon: '🗑️' });
    } catch (err) {
      toast.error('Failed to update Backlog');
    }
  };

  const handleRandomPick = () => {
    if (movies.length === 0) return toast.error("Your backlog is empty!");
    
    setIsRolling(true);
    let counter = 0;
    
    // Slot machine rapidly flashing selections
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * movies.length);
      setSelectedMovie(movies[randomIndex]);
      counter++;
      
      if (counter > 15) {
        clearInterval(interval);
        setIsRolling(false);
        const finalChoice = movies[Math.floor(Math.random() * movies.length)];
        setSelectedMovie(finalChoice);
        toast.success("Bro has spoken! Watch this.", { duration: 4000 });
      }
    }, 100);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Loading Backlog</span>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen pt-4 pb-16 px-6 relative z-20">
      
      {/* Background cinematic blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <Bookmark className="text-red-500" size={28} />
              </div>
              <h1 className="text-4xl md:text-5xl font-outfit font-black italic uppercase tracking-tighter drop-shadow-2xl">
                THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">BACKLOG</span>
              </h1>
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] max-w-sm">
              Your cinematic pipeline. Movies you saved for that generic "I don't know what to watch" moment.
            </p>
          </div>
          
          <button 
            onClick={handleRandomPick}
            disabled={isRolling || movies.length === 0}
            className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-[#b91c1c] px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] hover:scale-105 transition-all text-white disabled:opacity-50 disabled:scale-100"
          >
            <Dices size={16} className={isRolling ? 'animate-spin' : ''} />
            {isRolling ? "ROLLING..." : "BRO, PICK FOR ME"}
          </button>
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-50 relative z-10">
           <Bookmark size={64} className="text-zinc-700 mb-6" />
           <p className="text-2xl font-black italic uppercase tracking-widest text-zinc-500 text-center">Your Backlog is Clean</p>
           <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mt-2 text-center max-w-md">Go to the Vault and explore movies. Hit the bookmark icon to save them here for later.</p>
        </div>
      ) : (
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-6 pb-20 relative z-10">
          {movies.map((item) => {
            const myRating = ratings[item.id];
            return (
              <div key={item.id} className="group cursor-pointer flex flex-col">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden premium-glass transition-all duration-500 md:hover:border-red-600/60 md:hover:shadow-[0_0_40px_rgba(229,9,20,0.4)] group/poster">
                  <img
                    src={item.poster_path ? `${IMG_PATH}${item.poster_path}` : 'https://via.placeholder.com/500x750'}
                    className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110"
                    alt=""
                    onClick={() => !isRolling && setSelectedMovie(item)}
                  />

                  {/* Top Right Remove Button */}
                  <div className="absolute top-2 right-2 z-20">
                    <button 
                      onClick={(e) => removeFromBacklog(e, item.id)}
                      className="w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur border border-white/20 text-white rounded-full hover:bg-red-600 hover:border-red-500 transition-colors"
                    >
                      <Check size={14} />
                    </button>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/poster:opacity-100 transition-all duration-300 flex flex-col items-center justify-end pb-6 gap-3 translate-y-4 group-hover/poster:translate-y-0" onClick={() => !isRolling && setSelectedMovie(item)}>
                    <button
                      onClick={e => { e.stopPropagation(); !isRolling && setSelectedMovie(item); }}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase px-4 py-2 rounded-full border border-white/20 transition-all w-28 justify-center shadow-lg"
                    >
                      <Info size={12} /> Details
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); !isRolling && setAuditItem(item); }}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:scale-105 text-white text-[10px] font-black uppercase px-4 py-2 rounded-full transition-all shadow-[0_0_20px_rgba(229,9,20,0.5)] w-28 justify-center"
                    >
                      <Flame size={12} /> Rate
                    </button>
                  </div>

                  {myRating && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur border border-red-600/50 rounded-lg px-2 py-1">
                      <Flame size={9} fill="#ef4444" className="text-red-500" />
                      <span className="text-[9px] font-black text-white">{myRating}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 px-1">
                  <h3 className="text-[10px] font-outfit font-black uppercase truncate italic text-white/90 group-hover:text-white transition-colors">{item.title || item.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star size={11} fill="#fbbf24" className="text-[#fbbf24]" />
                    <span className="text-[11px] font-black text-[#fbbf24] tracking-tighter">{item.vote_average?.toFixed(1) || '0.0'}</span>
                    <span className="text-[8px] font-bold text-zinc-500 ml-auto uppercase">{item.release_date?.substring(0,4)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedMovie && (
        <div className={isRolling ? "pointer-events-none" : ""}>
          <DetailsModal
            selectedMovie={selectedMovie}
            onClose={() => !isRolling && setSelectedMovie(null)}
            onRateClick={(movie) => { setSelectedMovie(null); setAuditItem(movie); }}
          />
        </div>
      )}

      {auditItem && <BroAudit movie={auditItem} onClose={handleAuditClose} />}
    </div>
  );
};

export default BacklogPage;
