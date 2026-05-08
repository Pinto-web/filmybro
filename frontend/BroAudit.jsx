import React, { useState, useEffect } from 'react';
import { Star, X, Flame, ShieldAlert, RotateCcw, Check, Zap, MessageSquare, Tag, BarChart2, Award, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const ALL_TAGS = [
  '#MIND-BLOWN', '#VISUAL-MASTERPIECE', '#EPIC-SCALE',
  '#MUST-WATCH', '#OVERRATED', '#UNDERRATED',
  '#CERTIFIED-BRO', '#REWATCH-WORTHY', '#SNOOZE-FEST',
  '#IMAX-MANDATORY', '#CULT-CLASSIC', '#PLOT-ARMOR',
  '#VILLAIN-WALKED', '#SCORE-GOAT', '#GOOSEBUMPS',
];

const VERDICT_LABELS = [
  '', 'Absolute Dogwater', 'Total Miss', 'Skip It', 'Meh', 'Decent Watch',
  'Solid Flick', 'Very Good', 'Hidden Gem', 'Near Perfect', 'CERTIFIED BANGER'
];

const VERDICT_COLORS = [
  '', '#6b7280', '#9ca3af', '#d97706', '#d97706', '#84cc16',
  '#22d3ee', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444'
];

const BroAudit = ({ movie, onClose }) => {
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [hype, setHype] = useState(5);
  const [reality, setReality] = useState(5);
  const [selectedTags, setSelectedTags] = useState([]);
  const [review, setReview] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [reWatch, setReWatch] = useState(null);
  const [searchTagged, setSearchTagged] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [taggedBros, setTaggedBros] = useState([]);
  
  // Load existing rating on open
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('filmybro_user'));
    const userId = user ? user._id : 'guest';
    const stored = JSON.parse(localStorage.getItem(`filmybro_ratings_${userId}`) || '{}');
    const full = JSON.parse(localStorage.getItem(`filmybro_full_ratings_${userId}`) || '{}');
    if (stored[movie.id]) {
      setUserRating(stored[movie.id]);
    }
    if (full[movie.id]) {
      const d = full[movie.id];
      setHype(d.hype ?? 5);
      setReality(d.reality ?? 5);
      setSelectedTags(d.tags ?? []);
      setReview(d.review ?? '');
      setIsSpoiler(d.isSpoiler ?? false);
      setReWatch(d.reWatch ?? null);
      if (d.taggedBros) {
        setTaggedBros(d.taggedBros);
      }
    }
    
    // fetch users to tag
    if (user && user.token) {
      fetch('/api/users', { headers: { 'Authorization': `Bearer ${user.token}` } })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
               // Filter self out
               setAvailableUsers(data.filter(u => u._id !== userId));
            }
        })
        .catch(err => console.log('failed fetching users', err));
    }
  }, [movie.id]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  };

  const handleSubmit = async () => {
    if (userRating === 0) return;

    const user = JSON.parse(localStorage.getItem('filmybro_user'));
    const userId = user ? user._id : 'guest';

    let newBadges = [];

    try {
      if (!user || !user.token) throw new Error('Not authenticated');

      const payload = {
        movieId: movie.id,
        rating: userRating,
        hype,
        reality,
        review,
        tags: selectedTags,
        isSpoiler,
        wouldRewatch: reWatch,
        taggedBros: taggedBros.map(b => b._id)
      };

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      if (data.newBadges) newBadges = data.newBadges;
    } catch (err) {
      console.error(err);
      toast.error('Failed to post BroAudit securely');
      return;
    }

    // Save to localStorage
    const ratings = JSON.parse(localStorage.getItem(`filmybro_ratings_${userId}`) || '{}');
    ratings[movie.id] = userRating;
    localStorage.setItem(`filmybro_ratings_${userId}`, JSON.stringify(ratings));

    const fullRatings = JSON.parse(localStorage.getItem(`filmybro_full_ratings_${userId}`) || '{}');
    fullRatings[movie.id] = { hype, reality, tags: selectedTags, review, isSpoiler, reWatch, taggedBros };
    localStorage.setItem(`filmybro_full_ratings_${userId}`, JSON.stringify(fullRatings));

    toast.success('BroAudit securely locked in!');
    if (newBadges.length > 0) {
      newBadges.forEach(b => toast.success(`New Badge Unlocked: ${b}!`, { icon: '🏆', duration: 5000 }));
    }
    onClose();
  };

  const activeRating = hoverRating || userRating;
  const verdictLabel = VERDICT_LABELS[activeRating] || '';
  const verdictColor = VERDICT_COLORS[activeRating] || '#ef4444';

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#030305]/95 backdrop-blur-3xl overflow-y-auto transition-opacity"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[950px] rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.95)] border border-red-600/20 flex flex-col md:flex-row my-auto bg-[#070709] bg-opacity-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative ambient glow */}
        <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

        {/* Floating Close Button explicitly placed INSIDE the modal on mobile, or absolute top-right */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 z-[100] w-10 h-10 flex items-center justify-center bg-black/60 hover:bg-red-600 hover:scale-110 border border-white/20 rounded-full transition-all text-white shadow-xl backdrop-blur-md"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* ===== LEFT PANEL ===== */}
        <div className="md:w-[300px] shrink-0 flex flex-col" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          {/* Poster */}
          <div className="relative overflow-hidden h-[320px] md:h-[380px]">
            <img
              src={`${IMG_PATH}${movie.poster_path}`}
              className="w-full h-full object-cover"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent" />
            {/* Rating badge overlay */}
            {userRating > 0 && (
              <div className="absolute top-3 right-3 flex flex-col items-center bg-black/70 backdrop-blur-md border border-red-600/40 rounded-2xl px-3 py-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">YOUR</span>
                <span className="text-2xl font-black text-white leading-none">{userRating}</span>
                <span className="text-[8px] text-zinc-600 font-bold">/10</span>
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="p-6 flex flex-col gap-5 flex-1 relative z-10">
            <div>
              <h2 className="text-xl md:text-2xl font-outfit font-black italic uppercase tracking-tighter drop-shadow-md pb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 leading-tight">
                {movie.title || movie.name}
              </h2>
              <p className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.2em] mt-1">
                Your Personal Verdict
              </p>
            </div>

            {/* Community vs Bro scores */}
            <div className="space-y-2.5">
              <ScoreRow icon={Star} iconColor="#fbbf24" label="TMDB Score" value={movie.vote_average?.toFixed(1) || '—'} sub="Global" />
              <ScoreRow icon={Flame} iconColor="#ef4444" label="Bro Audit" value={userRating || '—'} sub="You" highlight />
            </div>

            {/* Mini hype vs reality viz */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 block mb-3">Hype vs Reality</span>
              <div className="flex items-end gap-3">
                <MiniBar label="HYPE" value={hype} color="rgba(96,165,250,0.8)" />
                <MiniBar label="REALITY" value={reality} color="rgba(239,68,68,0.9)" />
                <div className="flex-1 text-right">
                  <span className="text-[10px] font-black text-zinc-500 block">Gap</span>
                  <span className={`text-sm font-black ${reality >= hype ? 'text-green-400' : 'text-red-400'}`}>
                    {reality >= hype ? '+' : ''}{reality - hype}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="flex-1 flex flex-col p-7 md:p-9 overflow-y-auto custom-scrollbar max-h-[85vh] md:max-h-none">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center">
                <Award size={16} className="text-red-500" />
              </div>
              <div>
                <h1 className="text-base font-outfit font-black italic uppercase tracking-widest text-white leading-none">Bro-Audit</h1>
                <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 mt-0.5">Rate · Tag · Verdict</p>
              </div>
            </div>
          </div>

          {/* ── SECTION 1: Star Rating ── */}
          <Section icon={Star} title="Select Your Rating" accent="#facc15">
            <div className="flex flex-col items-center gap-6 bg-black/40 border border-white/5 py-8 rounded-[2rem] shadow-inner">
              <div 
                className="flex gap-1 sm:gap-2"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[...Array(10)].map((_, i) => {
                  const v = i + 1;
                  const active = v <= activeRating;
                  return (
                    <button
                      key={i}
                      type="button"
                      onMouseEnter={() => setHoverRating(v)}
                      onClick={() => setUserRating(v)}
                      className="cursor-pointer outline-none relative group touch-manipulation"
                    >
                      <Star
                        size={32}
                        className={`transition-all duration-300 drop-shadow-2xl ${active ? 'text-yellow-400 scale-[1.15]' : 'text-zinc-800 scale-100 group-hover:text-zinc-600'}`}
                        fill={active ? '#facc15' : '#18181b'}
                        strokeWidth={active ? 0 : 1}
                      />
                      {/* Tooltip to show number explicitly */}
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-black px-2 py-0.5 rounded border border-white/10">
                        {v}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              <div className="flex flex-col items-center h-16 justify-center">
                {activeRating > 0 ? (
                  <div className="text-center animate-fade-slide-in">
                    <span className="text-5xl font-black text-white italic tracking-tighter drop-shadow-md">
                      {activeRating}
                      <span className="text-xl text-zinc-600 font-bold ml-1">/10</span>
                    </span>
                    <span
                      className="mt-2 block text-[12px] font-black uppercase italic px-4 py-1 rounded-md"
                      style={{ color: verdictColor, backgroundColor: `${verdictColor}15`, border: `1px solid ${verdictColor}40` }}
                    >
                      {verdictLabel}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-black uppercase tracking-widest text-red-500 animate-pulse bg-red-600/10 px-4 py-2 rounded-full border border-red-600/20 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                    CLICK STARS TO RATE
                  </span>
                )}
              </div>
            </div>
          </Section>

          {/* ── SECTION 2: Hype vs Reality Sliders ── */}
          <Section icon={BarChart2} title="Hype vs Reality" accent="#60a5fa">
            <div className="space-y-5">
              <SliderRow label="HYPE" value={hype} onChange={setHype} color="#60a5fa" />
              <SliderRow label="REALITY" value={reality} onChange={setReality} color="#ef4444" />
            </div>
          </Section>

          {/* ── SECTION 3: Tag Cloud ── */}
          <Section icon={Tag} title={`Tag Cloud ${selectedTags.length > 0 ? `(${selectedTags.length}/5)` : ''}`} accent="#a855f7">
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map(tag => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-full border transition-all duration-200 ${
                      active
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/25 scale-105'
                        : 'bg-white/3 border-white/8 text-zinc-500 hover:border-zinc-600 hover:text-white hover:bg-white/6'
                    }`}
                    style={{ letterSpacing: '0.05em' }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ── SECTION 4: Written Verdict ── */}
          <Section icon={MessageSquare} title="Written Verdict" accent="#34d399">
            <div className="space-y-3">
              <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder="Drop your take on this one. No cap, no filter..."
                rows={3}
                className="w-full bg-black/60 border border-white/8 focus:border-red-600/50 rounded-2xl px-4 py-3 text-sm text-zinc-300 italic outline-none resize-none transition-all placeholder:text-zinc-700 custom-scrollbar"
                style={{ fontFamily: 'inherit' }}
              />
              
              {/* Tag Bros Input */}
              <div className="flex flex-col gap-2 mt-3">
                 <div className="flex items-center gap-2">
                   <Users size={12} className="text-blue-400" />
                   <span className="text-[10px] font-black uppercase text-zinc-400">Co-Op Watch? Tag Bros</span>
                 </div>
                 
                 <div className="flex flex-wrap gap-2 mb-2">
                    {taggedBros.map(bro => (
                      <span key={bro._id} className="flex items-center gap-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-md text-[10px] font-bold">
                        @{bro.name}
                        <button onClick={() => setTaggedBros(prev => prev.filter(b => b._id !== bro._id))} className="text-blue-300 hover:text-white">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                 </div>

                 {availableUsers.length > 0 && (
                   <select 
                     value=""
                     onChange={(e) => {
                       const userToAdd = availableUsers.find(u => u._id === e.target.value);
                       if (userToAdd && !taggedBros.find(b => b._id === userToAdd._id)) {
                         setTaggedBros([...taggedBros, userToAdd]);
                       }
                     }}
                     className="bg-black/60 border border-white/8 text-zinc-400 text-xs rounded-xl px-3 py-2 outline-none focus:border-blue-500/50 cursor-pointer"
                   >
                     <option value="" disabled>Select a Bro to Tag...</option>
                     {availableUsers.filter(u => !taggedBros.find(b => b._id === u._id)).map(u => (
                       <option key={u._id} value={u._id}>{u.name}</option>
                     ))}
                   </select>
                 )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setIsSpoiler(!isSpoiler)}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-wide transition-all px-3 py-2 rounded-xl border ${
                    isSpoiler
                      ? 'bg-red-600/20 border-red-600/40 text-red-400'
                      : 'bg-white/3 border-white/8 text-zinc-600 hover:text-white hover:border-zinc-600'
                  }`}
                >
                  <ShieldAlert size={12} />
                  {isSpoiler ? 'Contains Spoilers' : 'No Spoilers'}
                </button>
                <span className="text-[9px] text-zinc-700 font-bold">{review.length}/500</span>
              </div>
            </div>
          </Section>

          {/* ── SECTION 5: Rewatch & Submit ── */}
          <div className="mt-2 p-5 bg-black/40 border border-white/5 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-red-900/10 pointer-events-none" />
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 text-center sm:text-left">
                <RotateCcw size={9} className="inline mr-1.5 mb-0.5" />
                Would You Run It Back?
              </span>
              <div className="flex bg-black border border-white/8 rounded-full p-1 gap-1">
                {[{ label: 'HELL YES', val: true, activeClass: 'bg-green-600 text-white shadow-lg shadow-green-600/25' },
                  { label: 'NAH FAM', val: false, activeClass: 'bg-red-600 text-white shadow-lg shadow-red-600/25' }
                ].map(opt => (
                  <button
                    key={String(opt.val)}
                    onClick={() => setReWatch(opt.val)}
                    className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${
                      reWatch === opt.val ? opt.activeClass : 'text-zinc-600 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X size={15} className="inline mr-2 -mt-0.5" />
                Close
              </button>
              <button
                onClick={handleSubmit}
                disabled={userRating === 0}
                className={`flex items-center justify-center gap-3 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 w-full sm:w-auto ${
                  userRating > 0
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                }`}
              >
                <Zap size={15} fill={userRating > 0 ? "currentColor" : "none"} />
                Post Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ─── */

const Section = ({ icon: Icon, title, accent, children }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}>
        <Icon size={12} style={{ color: accent }} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{title}</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
    {children}
  </div>
);

const ScoreRow = ({ icon: Icon, iconColor, label, value, sub, highlight }) => (
  <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${highlight ? 'bg-red-500/8 border-red-600/25' : 'bg-white/3 border-white/6'}`}>
    <div className="flex items-center gap-2.5">
      <Icon size={14} fill={iconColor} style={{ color: iconColor }} />
      <div>
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: iconColor }}>{label}</span>
        <span className="text-[8px] text-zinc-700 font-bold ml-1.5">({sub})</span>
      </div>
    </div>
    <span className={`text-lg font-black ${highlight ? 'text-white' : 'text-zinc-300'}`}>{value}</span>
  </div>
);

const MiniBar = ({ label, value, color }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-6 h-16 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden flex flex-col-reverse">
      <div
        className="w-full rounded-full transition-all duration-500"
        style={{ height: `${value * 10}%`, background: color, boxShadow: `0 0 8px ${color}` }}
      />
    </div>
    <span className="text-[8px] font-black text-zinc-600 uppercase">{label}</span>
    <span className="text-[9px] font-black text-white">{value}</span>
  </div>
);

const SliderRow = ({ label, value, onChange, color }) => (
  <div className="flex items-center gap-4">
    <span className="text-[10px] font-black uppercase tracking-widest w-16 shrink-0" style={{ color }}>{label}</span>
    <div className="relative flex-1 h-2 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-200"
        style={{ width: `${value * 10}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 12px ${color}60` }}
      />
      <input
        type="range" min="0" max="10" step="1" value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
    <div className="w-10 text-right">
      <span className="text-sm font-black text-white">{value}</span>
      <span className="text-[9px] text-zinc-700 font-bold">/10</span>
    </div>
  </div>
);

export default BroAudit;