import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Flame, Star, MessageSquare, RotateCcw, ShieldAlert, AlertCircle, Loader } from 'lucide-react';


const API_KEY = '2dc3d5ac442a4f699e4d84f3b7f9d507';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const VERDICT_LABELS = [
  '', 'Absolute Dogwater', 'Total Miss', 'Skip It', 'Meh', 'Decent Watch',
  'Solid Flick', 'Very Good', 'Hidden Gem', 'Near Perfect', 'CERTIFIED BANGER'
];
const VERDICT_COLORS = [
  '', '#6b7280', '#9ca3af', '#d97706', '#d97706', '#84cc16',
  '#22d3ee', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444'
];

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [moviesByReview, setMoviesByReview] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('filmybro_user'));
        if (!user || !user.token) return;

        // Fetch backend
        const res = await axios.get('http://localhost:5000/api/reviews/me', {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        const dataMap = res.data.dataMap;
        const reviewList = Object.values(dataMap);
        setReviews(reviewList);

        // Fetch TMDB data for each movie
        const movieFetches = reviewList.map(r => axios.get(`${BASE_URL}/movie/${r.movieId}?api_key=${API_KEY}`).catch(() => axios.get(`${BASE_URL}/tv/${r.movieId}?api_key=${API_KEY}`)));
        
        const movieResponses = await Promise.allSettled(movieFetches);
        const resolvedMovies = {};
        
        movieResponses.forEach((response, idx) => {
           if (response.status === 'fulfilled' && response.value.data) {
             resolvedMovies[reviewList[idx].movieId] = response.value.data;
           }
        });

        setMoviesByReview(resolvedMovies);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyReviews();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#050505] text-white px-8 py-32 flex flex-col items-center">
        <Loader className="animate-spin text-red-600 mb-4" size={40} />
        <p className="text-sm font-black uppercase tracking-widest text-zinc-500">Loading Your Legacy...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#050505] text-white px-8 py-32 flex flex-col items-center justify-center">
        <Award size={80} className="text-zinc-800 mb-6" />
        <h1 className="text-4xl font-outfit font-black italic uppercase tracking-tighter text-zinc-500 leading-none mb-2">NO AUDITS YET</h1>
        <p className="text-xs font-bold tracking-widest uppercase text-zinc-600">Rate a movie to build your legacy.</p>
      </div>
    );
  }

  const averageScore = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white px-4 md:px-12 py-10 pt-16">
      
      <div className="max-w-[1500px] mx-auto mb-16">
        <h1 className="text-5xl font-outfit font-black italic uppercase tracking-tighter text-white leading-none">
          YOUR <span className="text-red-600">LEGACY</span>
        </h1>
        <div className="flex gap-4 items-center mt-6">
           <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex flex-col items-center">
             <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">Total Audits</span>
             <span className="text-2xl font-black text-white">{reviews.length}</span>
           </div>
           <div className="bg-red-600/10 border border-red-600/20 px-6 py-3 rounded-2xl flex flex-col items-center">
             <span className="text-[9px] font-black tracking-widest text-red-400 uppercase">Avg Score</span>
             <div className="flex bg-transparent mt-1 items-end gap-1">
               <span className="text-2xl leading-none font-black text-white">{averageScore}</span>
               <span className="text-xs font-bold text-red-500 leading-[18px]">/10</span>
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {reviews.map(review => {
          const tmdb = moviesByReview[review.movieId] || {};
          const verdictColor = VERDICT_COLORS[review.rating];
          const verdictLabel = VERDICT_LABELS[review.rating];

          return (
            <div key={review._id} className="relative bg-[#0c0c0c] border border-white/5 rounded-[30px] overflow-hidden group shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
              
              {/* Header section with backdrop */}
              <div className="relative h-44 w-full">
                {tmdb.backdrop_path || tmdb.poster_path ? (
                  <img src={`${IMG_PATH}${tmdb.backdrop_path || tmdb.poster_path}`} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700" alt="" />
                ) : (
                  <div className="w-full h-full bg-zinc-900"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/80 to-transparent"></div>
                
                <div className="absolute bottom-4 left-6 right-6">
                  <h2 className="text-xl font-outfit font-black italic uppercase tracking-tighter truncate leading-none mb-2">
                    {tmdb.title || tmdb.name || `ID: ${review.movieId}`}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[8px] font-black uppercase" style={{ color: verdictColor, background: `${verdictColor}15`, border: `1px solid ${verdictColor}40` }}>
                      {verdictLabel}
                    </span>
                    {review.wouldRewatch === true && (
                      <span className="flex items-center gap-1 text-[8px] font-black uppercase text-green-400 border border-green-500/30 bg-green-500/10 px-2 py-1 rounded-md">
                        <RotateCcw size={8} /> Rewatch
                      </span>
                    )}
                  </div>
                </div>

                {/* Score badge top right */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-red-500/30 w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-xl">
                  <Flame size={14} className="text-red-500 mb-0.5" />
                  <span className="text-xl font-black leading-none">{review.rating}</span>
                </div>
              </div>

              {/* Body Section */}
              <div className="p-6">
                
                {/* Hype/Reality Bar */}
                <div className="mb-6 flex items-center justify-between px-4 py-3 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[8px] font-black uppercase text-blue-400 tracking-widest">HYPE</span>
                    <span className="text-sm font-black">{review.hype}</span>
                  </div>
                  <div className="flex-1 px-4 flex items-center">
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-red-500 opacity-60 w-full" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[8px] font-black uppercase text-red-500 tracking-widest">REALITY</span>
                    <span className="text-sm font-black">{review.reality}</span>
                  </div>
                </div>

                {/* Review Text */}
                {review.review && (
                  <div className="mb-5 bg-black/40 border border-white/5 rounded-2xl p-4 relative">
                    <MessageSquare size={12} className="absolute top-3 left-3 text-zinc-600" />
                    {review.isSpoiler && (
                      <div className="flex items-center gap-1.5 mb-2 pl-4">
                        <ShieldAlert size={10} className="text-red-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-red-400">Spoiler Alert</span>
                      </div>
                    )}
                    <p className={`text-xs italic text-zinc-300 ${review.isSpoiler ? 'blur-sm hover:blur-none transition-all cursor-pointer' : ''}`}>
                      "{review.review}"
                    </p>
                  </div>
                )}

                {/* Tags */}
                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {review.tags.map(tag => (
                      <span key={tag} className="text-[8px] font-black tracking-wider uppercase px-2 py-1 bg-white/5 rounded-md text-zinc-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewsPage;
