import React, { useState } from 'react';
import axios from 'axios';
import { X, Search, Plus, Trophy, ListVideo, GripVertical, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_KEY = '2dc3d5ac442a4f699e4d84f3b7f9d507';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w200';

const DEFAULT_TIERS = [
  { label: 'S', color: '#ef4444', items: [] },
  { label: 'A', color: '#f97316', items: [] },
  { label: 'B', color: '#eab308', items: [] },
  { label: 'C', color: '#84cc16', items: [] },
  { label: 'D', color: '#3b82f6', items: [] },
];

const CreatePlaylistModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isTierList, setIsTierList] = useState(true);
  
  // Tier List State
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  
  // Flat List State
  const [flatItems, setFlatItems] = useState([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.results.slice(0, 10)); // Top 10 results
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = (movie) => {
    const newItem = { movieId: movie.id.toString(), posterPath: movie.poster_path };
    
    if (isTierList) {
      // Add to highest tier by default
      const newTiers = [...tiers];
      if (!newTiers[0].items.some(i => i.movieId === newItem.movieId)) {
        newTiers[0].items.push(newItem);
        setTiers(newTiers);
        toast.success(`Added ${movie.title} to Tier ${newTiers[0].label}`);
      } else {
        toast.error('Already in a tier');
      }
    } else {
      if (!flatItems.some(i => i.movieId === newItem.movieId)) {
        setFlatItems([...flatItems, newItem]);
        toast.success(`Added ${movie.title}`);
      } else {
        toast.error('Already in playlist');
      }
    }
  };

  const handleRemoveFromTier = (tierIdx, itemIdx) => {
    const newTiers = [...tiers];
    newTiers[tierIdx].items.splice(itemIdx, 1);
    setTiers(newTiers);
  };

  const handleRemoveFromFlat = (idx) => {
    const newItems = [...flatItems];
    newItems.splice(idx, 1);
    setFlatItems(newItems);
  };

  // Simple move mechanics for tier list (Up / Down)
  const moveItem = (tierIdx, itemIdx, direction) => {
    if (tierIdx + direction < 0 || tierIdx + direction >= tiers.length) return;
    const newTiers = [...tiers];
    const [item] = newTiers[tierIdx].items.splice(itemIdx, 1);
    newTiers[tierIdx + direction].items.push(item);
    setTiers(newTiers);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error('List needs a title, bro!');
    if (isTierList && !tiers.some(t => t.items.length > 0)) return toast.error('Add at least one movie to a tier!');
    if (!isTierList && flatItems.length === 0) return toast.error('Add at least one movie to your playlist!');

    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('filmybro_user'));
      
      const payload = {
        title,
        description,
        isTierList,
        tiers: isTierList ? tiers : [],
        flatItems: isTierList ? [] : flatItems
      };

      const res = await axios.post('http://localhost:5000/api/playlists', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (res.data.newBadges && res.data.newBadges.length > 0) {
        res.data.newBadges.forEach(b => toast.success(`New Badge Unlocked: ${b}!`, { icon: '🏆', duration: 5000 }));
      } else {
        toast.success('BroList Created!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to create BroList');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#030305]/95 backdrop-blur-3xl overflow-y-auto">
      <div className="relative w-full max-w-[1000px] h-[85vh] bg-[#070709] border border-red-600/20 rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.95)] flex flex-col md:flex-row overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center bg-black/60 rounded-full border border-white/20 hover:bg-red-600 transition-colors text-white">
          <X size={16} />
        </button>

        {/* LEFT PANEL: Search & Add */}
        <div className="md:w-[350px] bg-black/40 border-r border-white/5 flex flex-col p-6">
           <h2 className="text-xl font-outfit font-black italic uppercase tracking-wider text-white mb-1">
             Add <span className="text-red-500">Movies</span>
           </h2>
           <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-6">Search TMDB Database</p>

           <form onSubmit={handleSearch} className="flex relative mb-4">
             <input 
               type="text" 
               placeholder="Search..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 outline-none focus:border-red-500/50 text-xs text-white"
             />
             <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
               <Search size={16} />
             </button>
           </form>

           <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
             {isSearching && <p className="text-xs text-center text-zinc-500 font-bold uppercase py-4">Searching...</p>}
             {searchResults.map(movie => (
               <div key={movie.id} className="flex gap-3 bg-white/5 border border-white/5 rounded-xl p-2 items-center group touch-manipulation">
                  <img src={movie.poster_path ? `${IMG_PATH}${movie.poster_path}` : 'https://via.placeholder.com/200x300'} alt="" className="w-12 h-[72px] rounded border border-white/10 object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate">{movie.title}</p>
                    <p className="text-[10px] text-zinc-500 mt-1">{movie.release_date?.substring(0,4)}</p>
                  </div>
                  <button 
                    onClick={() => handleAddItem(movie)}
                    className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center hover:bg-red-600 hover:text-white border border-red-500/30 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
               </div>
             ))}
           </div>
        </div>

        {/* RIGHT PANEL: List Configuration */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
           
           <div className="flex bg-black/40 border border-white/5 rounded-full p-1 w-full max-w-sm mb-6 shrink-0">
              <button 
                onClick={() => setIsTierList(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[10px] font-black uppercase transition-colors ${isTierList ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Trophy size={14} /> Tier List
              </button>
              <button 
                onClick={() => setIsTierList(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[10px] font-black uppercase transition-colors ${!isTierList ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <ListVideo size={14} /> Flat List
              </button>
           </div>

           <div className="flex flex-col gap-4 mb-6 shrink-0">
             <input 
               type="text" 
               placeholder="BroList Title..."
               value={title}
               onChange={e => setTitle(e.target.value)}
               className="w-full bg-transparent border-b border-white/10 px-2 py-3 text-2xl font-outfit font-black italic uppercase text-white outline-none focus:border-red-500 placeholder:text-zinc-700 transition-colors"
             />
             <input 
               type="text" 
               placeholder="Optional description & context..."
               value={description}
               onChange={e => setDescription(e.target.value)}
               className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-sm text-zinc-300 outline-none focus:border-red-500 placeholder:text-zinc-700 transition-colors"
             />
           </div>

           <div className="flex-1 bg-black/30 border border-white/5 rounded-2xl p-4 overflow-y-auto custom-scrollbar">
             {isTierList ? (
               <div className="flex flex-col gap-3">
                 {tiers.map((tier, tIdx) => (
                   <div key={tIdx} className="flex gap-2 min-h-20 bg-black/50 border border-white/5 rounded-xl p-2 items-stretch">
                     <div className="w-16 flex-shrink-0 flex items-center justify-center rounded-lg font-black text-xl text-black" style={{ backgroundColor: tier.color }}>
                       {tier.label}
                     </div>
                     <div className="flex-1 flex flex-wrap gap-2 items-center px-2">
                       {tier.items.map((item, iIdx) => (
                         <div key={iIdx} className="relative group w-14 aspect-[2/3]">
                           <img src={`${IMG_PATH}${item.posterPath}`} className="w-full h-full object-cover rounded shadow-md border border-white/10" alt="" />
                           
                           {/* Quick Actions Hover */}
                           <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col items-center justify-center gap-1">
                             {tIdx > 0 && <button onClick={() => moveItem(tIdx, iIdx, -1)} className="text-white hover:text-blue-400 bg-white/10 rounded-sm w-full py-0.5 text-[8px] font-black uppercase">UP</button>}
                             {tIdx < tiers.length - 1 && <button onClick={() => moveItem(tIdx, iIdx, 1)} className="text-white hover:text-blue-400 bg-white/10 rounded-sm w-full py-0.5 text-[8px] font-black uppercase">DN</button>}
                             <button onClick={() => handleRemoveFromTier(tIdx, iIdx)} className="text-red-500 hover:text-white bg-red-500/20 rounded-sm w-full py-0.5 text-[8px] font-black uppercase mt-1">DEL</button>
                           </div>
                         </div>
                       ))}
                       {tier.items.length === 0 && <span className="text-[10px] uppercase font-bold text-zinc-600 p-2">Empty Tier</span>}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="flex flex-wrap gap-3">
                 {flatItems.map((item, idx) => (
                   <div key={idx} className="relative group w-20 aspect-[2/3]">
                     <img src={`${IMG_PATH}${item.posterPath}`} className="w-full h-full object-cover rounded-xl shadow-md border border-white/10" alt="" />
                     <button onClick={() => handleRemoveFromFlat(idx)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Trash2 size={12} />
                     </button>
                   </div>
                 ))}
                 {flatItems.length === 0 && (
                   <div className="w-full h-full flex flex-col items-center justify-center opacity-50 py-10">
                     <ListVideo size={40} className="mb-4" />
                     <p className="text-sm font-black uppercase tracking-widest text-white">Search and add movies to your list</p>
                   </div>
                 )}
               </div>
             )}
           </div>

           <div className="flex items-center justify-end pt-4 mt-4 border-t border-white/5 shrink-0">
             <button 
               onClick={handleSubmit} 
               disabled={isSubmitting}
               className="px-8 py-3 bg-gradient-to-r from-red-600 to-[#b91c1c] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50"
             >
               {isSubmitting ? 'Creating...' : 'Publish BroList'}
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CreatePlaylistModal;
