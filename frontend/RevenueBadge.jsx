import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BotMessageSquare, Landmark } from 'lucide-react';

const API_KEY = '2dc3d5ac442a4f699e4d84f3b7f9d507';
const BASE_URL = 'https://api.themoviedb.org/3';

const RevenueBadge = ({ movieId }) => {
  const [revenue, setRevenue] = useState(null);
  const [inView, setInView] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchRevenue = async () => {
      if (!movieId || !inView) return;
      try {
        const res = await axios.get(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
        if (isMounted) setRevenue(res.data.revenue);
      } catch (err) {
        console.error("Fetch revenue error:", err);
      }
    };
    fetchRevenue();
    return () => { isMounted = false; };
  }, [movieId, inView]);

  if (revenue === null) return (
    <div ref={ref} className="flex items-center gap-1.5 mt-1 animate-pulse">
      <div className="w-4 h-4 rounded-full bg-white/10"></div>
      <div className="w-16 h-3 rounded bg-white/10"></div>
    </div>
  );
  
  // Format revenue as currency
  const formattedRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(revenue);

  return (
    <div className="flex items-center gap-1.5 mt-1 border border-zinc-800 bg-zinc-950/50 py-1 px-1.5 rounded w-max">
      <Landmark size={12} fill="#22c55e" className="text-green-500" />
      <span className="text-[10px] font-black text-green-500 tracking-tighter shadow-sm">
        {revenue > 0 ? formattedRevenue : 'N/A'}
      </span>
    </div>
  );
};

export default RevenueBadge;
