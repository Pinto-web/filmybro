import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, Calendar, X, Flame, Zap, User, Film, ChevronRight } from 'lucide-react';

const IMG_PATH = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_PATH = 'https://image.tmdb.org/t/p/w1280';
const API_KEY = '2dc3d5ac442a4f699e4d84f3b7f9d507';
const BASE_URL = 'https://api.themoviedb.org/3';

const DetailsModal = ({ selectedMovie, onClose, onRateClick }) => {
  const [director, setDirector] = useState(null);
  const [genres, setGenres] = useState([]);
  const [runtime, setRuntime] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [broRating, setBroRating] = useState(null);
  const [imdbId, setImdbId] = useState(null);

  useEffect(() => {
    if (!selectedMovie) return;

    // Load stored bro rating
    const user = JSON.parse(localStorage.getItem('filmybro_user'));
    const userId = user ? user._id : 'guest';
    const stored = JSON.parse(localStorage.getItem(`filmybro_ratings_${userId}`) || '{}');
    setBroRating(stored[selectedMovie.id] || null);

    // Fetch director/credits
    const mediaType = selectedMovie.media_type || (selectedMovie.title ? 'movie' : 'tv');
    setLoadingDetails(true);
    setDirector(null);
    setGenres([]);
    setRuntime(null);
    setImdbId(null);

    const detailsUrl = `${BASE_URL}/${mediaType}/${selectedMovie.id}?api_key=${API_KEY}&append_to_response=credits,external_ids`;
    axios.get(detailsUrl).then(res => {
      const data = res.data;
      if (mediaType === 'movie') {
        const dir = data.credits?.crew?.find(c => c.job === 'Director');
        setDirector(dir ? dir.name : 'N/A');
        setRuntime(data.runtime || null);
      } else {
        const creator = data.created_by?.[0];
        setDirector(creator ? creator.name : 'N/A');
      }
      setGenres(data.genres?.slice(0, 3) || []);
      setImdbId(data.external_ids?.imdb_id || data.imdb_id || null);
    }).catch(() => {
      setDirector('N/A');
    }).finally(() => setLoadingDetails(false));
  }, [selectedMovie]);

  if (!selectedMovie) return null;

  const backdropUrl = selectedMovie.backdrop_path
    ? `${BACKDROP_PATH}${selectedMovie.backdrop_path}`
    : null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl premium-glass bg-black/80 rounded-[2.5rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.95)] flex flex-col border border-white/10 ring-1 ring-white/5"
        style={{ animation: 'modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Backdrop Hero */}
        <div className="relative h-52 w-full overflow-hidden shrink-0">
          {backdropUrl ? (
            <img src={backdropUrl} className="w-full h-full object-cover object-top" alt="" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-950 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-[#080808]" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-600/80 transition-all"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row gap-0 -mt-24 relative z-10 px-6 pb-8 md:px-8">
          {/* Poster */}
          <div className="shrink-0 w-36 md:w-44 mx-auto md:mx-0">
            <div className="rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-black/80">
              <img
                src={selectedMovie.poster_path ? `${IMG_PATH}${selectedMovie.poster_path}` : 'https://via.placeholder.com/500x750'}
                className="w-full aspect-[2/3] object-cover"
                alt={selectedMovie.title || selectedMovie.name}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-28 md:pl-8 flex flex-col gap-5">
            {/* Title & Genres */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {genres.map(g => (
                  <span key={g.id} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-red-600/20 text-red-400 border border-red-600/30 rounded-full">
                    {g.name}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-outfit font-black uppercase italic tracking-tight text-white leading-tight">
                {selectedMovie.title || selectedMovie.name}
              </h2>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-stretch gap-px bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
              {/* TMDB Rating */}
              <div className="flex-1 flex flex-col items-center justify-center py-4 px-3 bg-[#0e0e0e] min-w-[90px]">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">TMDB</span>
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <Star size={15} fill="currentColor" />
                  <span className="text-lg font-black tracking-tighter">
                    {selectedMovie.vote_average ? selectedMovie.vote_average.toFixed(1) : '—'}
                  </span>
                </div>
              </div>

              {/* IMDB Button */}
              {imdbId && (
                <a href={`https://www.imdb.com/title/${imdbId}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col items-center justify-center py-4 px-3 bg-[#f5c518]/10 hover:bg-[#f5c518]/20 transition-all min-w-[90px] cursor-pointer group">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#f5c518]/80 group-hover:text-[#f5c518] mb-1.5 transition-colors">ON IMDB</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#000000] bg-[#f5c518] text-[11px] font-black px-1.5 py-0.5 rounded-sm">IMDb</span>
                  </div>
                </a>
              )}

              {/* Bro Audit Rating */}
              <div className="flex-1 flex flex-col items-center justify-center py-4 px-3 bg-[#0e0e0e] min-w-[90px]">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">BRO AUDIT</span>
                <div className="flex items-center gap-1.5 text-red-500">
                  <Flame size={15} fill="currentColor" />
                  <span className="text-lg font-black tracking-tighter">
                    {broRating !== null ? broRating : '—'}
                  </span>
                </div>
              </div>

              {/* Release Date */}
              <div className="flex-1 flex flex-col items-center justify-center py-4 px-3 bg-[#0e0e0e] min-w-[90px]">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">RELEASED</span>
                <div className="flex items-center gap-1.5 text-white">
                  <Calendar size={14} className="text-zinc-500" />
                  <span className="text-xs font-bold">
                    {(selectedMovie.release_date || selectedMovie.first_air_date)?.slice(0, 4) || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Director */}
              <div className="flex-1 flex flex-col items-center justify-center py-4 px-3 bg-[#0e0e0e] min-w-[110px]">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">DIRECTOR</span>
                <div className="flex items-center gap-1.5 text-white">
                  <User size={13} className="text-zinc-500 shrink-0" />
                  <span className="text-[10px] font-bold text-center leading-tight">
                    {loadingDetails ? (
                      <span className="w-16 h-3 bg-zinc-800 rounded animate-pulse inline-block" />
                    ) : director || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Runtime (movies only) */}
              {runtime && (
                <div className="flex-1 flex flex-col items-center justify-center py-4 px-3 bg-[#0e0e0e] min-w-[80px]">
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">RUNTIME</span>
                  <span className="text-[11px] font-bold text-white">{runtime}m</span>
                </div>
              )}
            </div>

            {/* Synopsis */}
            <div>
              <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 mb-2.5 flex items-center gap-2">
                <Film size={10} className="text-red-600" /> Synopsis
              </span>
              <p className="text-sm text-zinc-300 leading-relaxed italic border-l-2 border-red-600/40 pl-4 max-h-28 overflow-y-auto custom-scrollbar">
                {selectedMovie.overview || 'No synopsis available for this title.'}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                onRateClick(selectedMovie);
                onClose();
              }}
              className="group flex items-center gap-3 self-start bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] transition-all active:scale-95 shadow-[0_8px_25px_rgba(239,68,68,0.35)] hover:shadow-[0_12px_35px_rgba(239,68,68,0.5)]"
            >
              <Zap size={15} fill="currentColor" />
              Rate on Bro-Audit
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DetailsModal;
