import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ListVideo, Plus, Trophy, Flame, PlayCircle, Users, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CreatePlaylistModal from './src/components/CreatePlaylistModal';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('global'); // 'global' or 'my'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('filmybro_user'));

  useEffect(() => {
    fetchPlaylists();
  }, [tab]);

  const fetchPlaylists = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const endpoint = tab === 'global' ? '/api/playlists/global' : '/api/playlists/my';
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPlaylists(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  };

  const likePlaylist = async (id) => {
    try {
      const res = await axios.put(`/api/playlists/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPlaylists(playlists.map(p => p._id === id ? { ...p, likes: res.data.data.likes } : p));
    } catch (err) {
      toast.error('Failed to like playlist');
    }
  };

  return (
    <div className="w-full min-h-screen pt-4 pb-24 px-6 relative z-20">
      <div className="max-w-[1200px] mx-auto min-h-screen">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <ListVideo className="text-red-500" size={32} />
            </div>
            <div>
               <h1 className="text-4xl md:text-5xl font-outfit font-black italic uppercase tracking-tighter drop-shadow-2xl">
                 BRO<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">LISTS</span>
               </h1>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Curated Tier Lists & Playlists</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-black/40 border border-white/5 rounded-full p-1 flex">
               <button 
                 onClick={() => setTab('global')}
                 className={`px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all ${tab === 'global' ? 'bg-red-600/20 text-red-500 border border-red-500/30' : 'text-zinc-500 hover:text-white'}`}
               >
                 Global
               </button>
               <button 
                 onClick={() => setTab('my')}
                 className={`px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all ${tab === 'my' ? 'bg-red-600/20 text-red-500 border border-red-500/30' : 'text-zinc-500 hover:text-white'}`}
               >
                 My Lists
               </button>
             </div>
             
             {tab === 'my' && (
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-[#b91c1c] text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                  <Plus size={14} /> Create
                </button>
             )}
          </div>
        </div>

        {loading ? (
            <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
            </div>
        ) : playlists.length === 0 ? (
            <div className="text-center py-32 opacity-50 flex flex-col items-center">
              <ListVideo size={64} className="text-zinc-700 mb-6" />
              <p className="text-2xl font-black italic uppercase tracking-widest text-zinc-500">No Lists Found</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {playlists.map((pl) => (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={pl._id} className="premium-glass rounded-[2.5rem] p-8 flex flex-col hover:border-red-600/40 hover:shadow-[0_20px_60px_rgba(229,9,20,0.2)] transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                           {pl.isTierList ? (
                             <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 p-2 rounded-xl">
                               <Trophy size={20} />
                             </div>
                           ) : (
                             <div className="bg-blue-500/20 border border-blue-500/30 text-blue-500 p-2 rounded-xl">
                               <PlayCircle size={20} />
                             </div>
                           )}
                           <div>
                             <h3 className="text-xl font-black italic uppercase tracking-wider text-white leading-tight">{pl.title}</h3>
                             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">By @{pl.user?.name}</p>
                           </div>
                         </div>
                      </div>
                      
                      {pl.description && <p className="text-sm text-zinc-400 italic mb-4">"{pl.description}"</p>}
                      
                      {/* Visual rendering logic based on tier vs flat list */}
                      <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-4 flex-1 mb-4">
                          {pl.isTierList ? (
                             <div className="flex flex-col gap-2">
                                {pl.tiers?.slice(0, 3).map((tier, idx) => (
                                    <div key={idx} className="flex gap-2 min-h-12">
                                        <div className="w-12 flex-shrink-0 flex items-center justify-center font-black rounded-lg text-black bg-white" style={{ backgroundColor: tier.color }}>
                                           {tier.label}
                                        </div>
                                        <div className="flex-1 bg-black/40 rounded-lg border border-white/5 flex items-center p-1 gap-1 overflow-hidden">
                                           {tier.items?.slice(0, 5).map(item => (
                                             <img key={item.movieId} src={`https://image.tmdb.org/t/p/w200${item.posterPath}`} className="h-full aspect-[2/3] object-cover rounded shadow-md" alt="" />
                                           ))}
                                           {tier.items?.length > 5 && <span className="text-[9px] font-black text-zinc-600 pl-1">+{tier.items.length - 5}</span>}
                                        </div>
                                    </div>
                                ))}
                                {pl.tiers?.length > 3 && <p className="text-center text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">+ {pl.tiers.length - 3} More Tiers</p>}
                             </div>
                          ) : (
                             <div className="flex gap-2 overflow-hidden items-center justify-center h-full min-h-24">
                               {pl.flatItems?.slice(0, 5).map(item => (
                                 <img key={item.movieId} src={`https://image.tmdb.org/t/p/w200${item.posterPath}`} className="w-16 h-24 object-cover rounded-lg shadow-md border border-white/10" alt="" />
                               ))}
                               {pl.flatItems?.length > 5 && <span className="text-[10px] font-black text-zinc-600 ml-2">+{pl.flatItems.length - 5} MORE</span>}
                             </div>
                          )}
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                         <button 
                           onClick={() => likePlaylist(pl._id)}
                           className={`flex items-center gap-2 ${pl.likes?.includes(user?.id) ? 'text-red-500' : 'text-zinc-500'} hover:text-red-400 font-black text-xs uppercase tracking-widest transition-colors`}
                         >
                            <Flame size={16} fill={pl.likes?.includes(user?.id) ? "currentColor" : "none"} /> {pl.likes?.length || 0}
                         </button>
                         <button className="text-[10px] font-black uppercase text-zinc-400 bg-white/5 px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
                           View Full List
                         </button>
                      </div>
                  </motion.div>
               ))}
            </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePlaylistModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchPlaylists}
        />
      )}
    </div>
  );
};

export default PlaylistsPage;
