// Community section removed as per request. This file is no longer used.

import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Flame, MessageSquare, Plus, Star, Award, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const CommunityPage = () => {
  const [feed, setFeed] = useState([]);
  const [topBros, setTopBros] = useState([]);
  const [hotTakeContent, setHotTakeContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeReply, setActiveReply] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState([]);
  const user = JSON.parse(localStorage.getItem('filmybro_user'));

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    if (!user) return;
    try {
      const authArgs = { headers: { Authorization: `Bearer ${user.token}` } };
      const [feedRes, brosRes] = await Promise.all([
        axios.get('/api/community/feed', authArgs),
        axios.get('/api/community/top-bros', authArgs)
      ]);
      setFeed(feedRes.data.data);
      setTopBros(brosRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load community feed');
    } finally {
      setLoading(false);
    }
  };

  const handlePostTake = async (e) => {
    e.preventDefault();
    if (!hotTakeContent.trim()) return;
    
    try {
      const res = await axios.post('/api/community/takes', { content: hotTakeContent }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFeed([{ ...res.data.data, type: 'take' }, ...feed]);
      setHotTakeContent('');
      toast.success('Take dropped!', { icon: '🔥' });
      
      if (res.data.newBadges && res.data.newBadges.length > 0) {
        res.data.newBadges.forEach(b => toast.success(`New Badge Unlocked: ${b}!`, { icon: '🏆', duration: 5000 }));
      }
    } catch (err) {
      toast.error('Failed to post take');
    }
  };

  const handleLikeTake = async (id, e) => {
    e.preventDefault(); // In case of double tap
    try {
      const res = await axios.put(`/api/community/takes/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const newLikes = res.data.data.likes;
      setFeed(feed.map(item => item._id === id ? { ...item, likes: newLikes } : item));
    } catch (err) {
      toast.error('Failed to flame');
    }
  };

  const handleReplySubmit = async (takeId) => {
    if (!replyContent.trim()) return;
    try {
      const res = await axios.post(`/api/community/takes/${takeId}/reply`, { content: replyContent }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFeed(feed.map(item => item._id === takeId ? { ...res.data.data, type: 'take' } : item));
      setReplyContent('');
      setActiveReply(null);
      setExpandedReplies(prev => prev.includes(takeId) ? prev : [...prev, takeId]);
      toast.success('Reply added!');
    } catch (err) {
      toast.error('Failed to reply');
    }
  };

  // Instagram Double Tap logic for reviews natively simulated
  const handleDoubleTap = (id) => {
    // We visually toast for reviews right now since likes aren't fully baked into Review schema currently, just HotTakes
    toast('Flames Added!', { icon: '🔥', style: { background: '#ef4444', color: '#fff' } });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full min-h-screen pt-4 pb-24 px-6 relative z-20">
      <div className="max-w-[1400px] mx-auto min-h-screen">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <Users className="text-red-500" size={32} />
          </div>
          <div>
             <h1 className="text-4xl md:text-5xl font-outfit font-black italic uppercase tracking-tighter drop-shadow-2xl">
               THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">NETWORK</span>
             </h1>
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Cinephile Timeline & Takes</p>
          </div>
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Leaderboard / Explore */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-6">
             <div className="glass rounded-[2rem] p-6 sticky top-28">
               <h3 className="text-sm font-outfit font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                 <Award size={16} className="text-yellow-500" /> Leaderboard
               </h3>
               <div className="space-y-4">
                  {topBros.slice(0, 5).map((bro, idx) => (
                    <div key={bro._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                       <span className="text-2xl font-black italic text-zinc-700">#{idx + 1}</span>
                       <div className="w-10 h-14 bg-zinc-800 rounded shadow-md overflow-hidden flex items-center justify-center">
                          <span className="text-2xl font-outfit font-black text-zinc-600">{bro.name.charAt(0)}</span>
                       </div>
                       <div>
                         <div className="text-[10px] font-bold uppercase text-zinc-400 truncate w-32 flex flex-col gap-1">
                           <span>{bro.name}</span>
                           {bro.badges && bro.badges.length > 0 && (
                             <span className="inline-flex flex-wrap gap-1">
                               {bro.badges.slice(0, 2).map((b) => (
                                 <span key={b} title={b} className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 text-[7px] font-black uppercase tracking-[0.2em] px-1 rounded border border-orange-500/30 line-clamp-1 truncate">
                                   <Award size={6} className="inline mr-0.5" /> {b}
                                 </span>
                               ))}
                             </span>
                           )}
                         </div>
                         <p className="text-[11px] font-black text-red-500 line-clamp-1 mt-1">Top Bro <span className="text-[8px] text-zinc-500">STATUS</span></p>
                       </div>
                    </div>
                  ))}
               </div>
               <p className="text-[8px] mt-4 text-center text-zinc-500 uppercase tracking-[0.2em]">Aggregating Bro-Audits globally.</p>
             </div>
          </div>

          {/* MIDDLE: THE FEED */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Top Bros (Instagram Stories) */}
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
               {topBros.map((bro, idx) => (
                 <div key={bro._id} className="flex flex-col items-center gap-2 cursor-pointer group shrink-0">
                    <div className="w-16 h-16 rounded-full border-2 border-red-600 p-[2px] transition-transform group-hover:scale-105">
                       <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center shadow-inner">
                          <span className="text-2xl font-outfit font-black text-zinc-600">{bro.name.charAt(0)}</span>
                       </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 truncate w-16 text-center">{bro.name}</span>
                 </div>
               ))}
            </div>

            {/* Drop a Take Component (Twitter Style) */}
            <div className="glass rounded-[2rem] p-6 mb-2">
              <form onSubmit={handlePostTake} className="flex flex-col gap-4">
                 <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 shrink-0 border border-white/10 flex items-center justify-center font-black text-zinc-500">
                       {user?.name?.charAt(0) || '?'}
                    </div>
                    <textarea 
                      value={hotTakeContent}
                      onChange={e => setHotTakeContent(e.target.value)}
                      placeholder="Drop a hot take... change our minds."
                      className="w-full bg-transparent border-none focus:outline-none resize-none text-lg text-white placeholder:text-zinc-600 placeholder:italic font-outfit"
                      rows={2}
                      maxLength={280}
                    />
                 </div>
                 <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                    <span className="text-[10px] text-zinc-600 font-bold">{hotTakeContent.length}/280</span>
                    <button 
                      type="submit"
                      disabled={!hotTakeContent.trim()}
                      className="px-6 py-2 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    >
                      Post Take
                    </button>
                 </div>
              </form>
            </div>

            {/* FEED ITEMS */}
            <div className="flex flex-col gap-8">
              {feed.map(item => {
                if (item.type === 'take') {
                  // Twitter-style Hot Take
                  const hasLiked = item.likes?.includes(user?.id);
                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={item._id} className="glass-card rounded-[2rem] p-6 flex flex-col gap-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-black text-zinc-500">{item.user?.name?.charAt(0) || '?'}</div>
                           <div className="flex flex-col">
                             <div className="flex items-center">
                               <span className="text-[12px] font-black uppercase text-white tracking-wider">{item.user?.name || 'Anonymous'}</span>
                               {item.user?.badges && item.user.badges.map(b => (
                                 <span key={b} title={b} className="ml-2 inline-flex items-center bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded border border-orange-500/30">
                                   <Award size={8} className="mr-1"/> {b}
                                 </span>
                               ))}
                             </div>
                             <span className="text-[9px] text-zinc-600 font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                           </div>
                         </div>
                         <TrendBadge />
                       </div>
                       <p className="text-xl font-outfit text-white leading-relaxed">{item.content}</p>
                       
                       {/* Actions */}
                       <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/5">
                         <button onClick={(e) => handleLikeTake(item._id, e)} className={`flex items-center gap-2 ${hasLiked ? 'text-red-500' : 'text-zinc-500'} hover:text-red-400 transition-colors`}>
                           <Flame size={18} fill={hasLiked ? "currentColor" : "none"} />
                           <span className="text-xs font-black">{item.likes?.length || 0}</span>
                         </button>
                         <button onClick={() => setExpandedReplies(prev => prev.includes(item._id) ? prev.filter(i => i !== item._id) : [...prev, item._id])} className="flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-colors">
                           <MessageSquare size={18} />
                           <span className="text-xs font-black">{item.replies?.length || 0} Replies</span>
                         </button>
                       </div>

                       {/* Replies Section */}
                       {expandedReplies.includes(item._id) && (
                         <div className="mt-2 pt-4 border-t border-white/5 space-y-4">
                           {item.replies?.map((reply, i) => (
                             <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={i} className="flex gap-3 items-start bg-white/5 p-3 rounded-2xl border border-white/5">
                               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-black text-xs text-zinc-500 shrink-0">
                                 {reply.user?.name?.charAt(0) || '?'}
                               </div>
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                     <span className="text-[10px] font-black uppercase tracking-widest">{reply.user?.name || 'Anonymous'}</span>
                                     <span className="text-[8px] text-zinc-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-sm text-zinc-300 leading-relaxed font-outfit">{reply.content}</p>
                               </div>
                             </motion.div>
                           ))}
                           {(!item.replies || item.replies.length === 0) && (
                             <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest italic my-2">No replies yet. Start the debate.</p>
                           )}

                           <div className="flex items-center gap-3 mt-4">
                             <div className="w-8 h-8 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center font-black text-xs text-zinc-500 shrink-0">
                                {user?.name?.charAt(0) || '?'}
                             </div>
                             <div className="flex-1 flex items-center bg-black/40 border border-white/10 rounded-full px-4 py-2.5 focus-within:border-blue-500/50 transition-colors">
                               <input 
                                 type="text" 
                                 placeholder="Write a reply..."
                                 value={activeReply === item._id ? replyContent : ''}
                                 onChange={e => { setActiveReply(item._id); setReplyContent(e.target.value); }}
                                 onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleReplySubmit(item._id);
                                 }}
                                 className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-zinc-600 font-outfit"
                               />
                               {activeReply === item._id && replyContent.trim() && (
                                 <button onClick={() => handleReplySubmit(item._id)} className="text-blue-500 hover:text-blue-400 transition-colors text-[10px] font-black uppercase tracking-widest ml-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">Post</button>
                               )}
                             </div>
                           </div>
                         </div>
                       )}
                    </motion.div>
                  );
                }

                // Letterboxd/Instagram-style Review
                if (item.type === 'review') {
                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={item._id} className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col" onDoubleClick={() => handleDoubleTap(item._id)}>
                       
                       {/* Header */}
                       <div className="flex items-center gap-3 p-5">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-red-600/50 flex items-center justify-center font-black text-zinc-400">{item.user?.name?.charAt(0) || '?'}</div>
                          <div className="flex flex-col">
                             <div className="flex items-center flex-wrap gap-y-1">
                               <span className="text-[11px] font-black uppercase text-white tracking-wider mr-1">{item.user?.name || 'Anonymous'}</span>
                               {item.user?.badges && item.user.badges.map(b => (
                                 <span key={b} title={b} className="mr-2 inline-flex items-center bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded border border-orange-500/30">
                                   <Award size={8} className="mr-1"/> {b}
                                 </span>
                               ))}
                               {item.taggedBros && item.taggedBros.length > 0 ? (
                                  <span className="text-[11px] text-zinc-400 font-normal mr-1">watched with</span>
                               ) : (
                                  <span className="text-[11px] text-zinc-500 font-normal">logged an audit</span>
                               )}
                               {item.taggedBros && item.taggedBros.map((bro, idx) => (
                                 <span key={bro._id} className="text-[11px] font-black uppercase text-blue-400 tracking-wider">
                                   @{bro.name}{idx < item.taggedBros.length - 1 ? ', ' : ' '}
                                 </span>
                               ))}
                             </div>
                             <span className="text-[9px] text-zinc-600 font-bold mt-1">{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>

                       {/* Big Visual (Instagram Style) */}
                       <div className="w-full relative bg-[#0a0a0a] border-y border-white/5 flex items-center justify-center p-6 shadow-inner cursor-pointer group">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10 pointer-events-none" />
                          <div className="relative w-[300px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl z-20 transition-transform duration-500 group-hover:scale-[1.02]">
                             {/* Since we don't have movie title populated yet in Reviews, we fake the TMDB poster placeholder */}
                             <div className="w-full h-full bg-[#111] flex items-center justify-center text-zinc-700">
                               <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">Movie ID: {item.movieId}</span>
                             </div>
                             
                             {/* Rating Badge Overlay */}
                             <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-red-500/50 rounded-2xl px-3 py-2 flex flex-col items-center">
                               <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">VERDICT</span>
                               <span className="text-2xl font-black text-white leading-none">{item.rating}</span>
                             </div>
                          </div>
                          
                          {/* Heart animation hint */}
                          <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                             <Flame size={120} className="text-white" />
                          </div>
                       </div>

                       {/* Letterboxd Data / Review */}
                       <div className="p-6 flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                             <div className="flex gap-1">
                               {[...Array(item.rating)].map((_, i) => <Star key={i} size={12} className="text-red-500" fill="currentColor"/>)}
                             </div>
                             {item.wouldRewatch && <span className="text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20">Rewatch</span>}
                          </div>
                          
                          {item.review && (
                            <p className="text-sm text-zinc-300 italic max-h-32 overflow-y-auto custom-scrollbar border-l-2 border-red-600/30 pl-3">
                              "{item.review}"
                            </p>
                          )}
                          
                          {item.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                               {item.tags.map(tag => (
                                 <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-[#a855f7] bg-[#a855f7]/10 px-2.5 py-1 rounded-full">{tag}</span>
                               ))}
                            </div>
                          )}

                          <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/5">
                             <button onClick={() => handleDoubleTap(item._id)} className="flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-colors">
                               <Flame size={18} />
                             </button>
                             <button className="flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-colors">
                               <MessageSquare size={18} />
                             </button>
                          </div>
                       </div>

                    </motion.div>
                  );
                }
                return null;
              })}
              
              {feed.length === 0 && (
                <div className="text-center py-20 text-zinc-600 font-bold uppercase tracking-widest text-xs">
                   No activity yet. Be the first to drop a take.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Trends & Debates Placeholder */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-6">
             <div className="glass rounded-[2rem] p-6 sticky top-28">
               <h3 className="text-sm font-outfit font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                 <TrendingUp size={16} className="text-blue-500" /> Hot Debates
               </h3>
               
               <div className="flex flex-col gap-4">
                  <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl">
                     <p className="text-[11px] font-black text-white italic">"Does CGI ruin modern action?"</p>
                     <p className="text-[9px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">34 Bros Arguing</p>
                  </div>
                  <div className="p-4 bg-red-600/10 border border-red-500/30 rounded-2xl">
                     <p className="text-[11px] font-black text-white italic">"Dune 2 vs The Dark Knight"</p>
                     <p className="text-[9px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">Global Vote Active</p>
                  </div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const TrendBadge = () => (
  <span className="flex items-center gap-1 bg-red-600/20 text-red-500 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full border border-red-600/40">
    <TrendingUp size={10} /> HOT
  </span>
);

export default CommunityPage;
