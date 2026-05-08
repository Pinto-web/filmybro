import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Play, Star, Users, TrendingUp, Info, LogOut, Code, X } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

import MoviesPage from './MoviesPage';
import TrendingPage from './TrendingPage';
import ReviewsPage from './ReviewsPage';
import BacklogPage from './BacklogPage';

import PlaylistsPage from './PlaylistsPage';


import p1 from './src/assets/poster1.jpeg';
import p2 from './src/assets/poster2.jpeg';
import p3 from './src/assets/poster3.jpeg';
import p4 from './src/assets/poster4.jpeg';
import p5 from './src/assets/poster5.jpeg';
import p6 from './src/assets/poster6.jpeg';
import p7 from './src/assets/poster7.jpeg';
import p8 from './src/assets/poster8.jpeg';
import p9 from './src/assets/poster9.jpeg';
import p10 from './src/assets/poster10.jpeg';
import logo from './src/assets/logo.jpeg';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashOpacity, setSplashOpacity] = useState(1);
  const [modalType, setModalType] = useState(null); 
  const [currentUser, setCurrentUser] = useState(null);
  const [authForm, setAuthForm] = useState({ username: '', email: '', age: '', password: '' });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAboutPage = location.pathname === '/about';
  const isMoviesPage = location.pathname === '/movies';
  const isTrendingPage = location.pathname === '/trending';
  const isBacklogPage = location.pathname === '/backlog';
  
  const homePosters = [p1, p2, p3, p4, p5, p6];
  const aboutPosters = [p7, p8, p9, p10, p7, p8]; 

  useEffect(() => {
    // Splash screen timing
    const t1 = setTimeout(() => setSplashOpacity(0), 1800);
    const t2 = setTimeout(() => setShowSplash(false), 2600);
    
    // Auth logic
    const savedUser = localStorage.getItem('filmybro_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    // Axios global interceptor for 401s
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response && err.response.status === 401 && err.config?.url?.includes('localhost:5000')) {
          localStorage.removeItem('filmybro_user');
          setCurrentUser(null);
          toast.error("Session expired. Please log in again.");
          navigate('/');
        }
        return Promise.reject(err);
      }
    );

    return () => { 
      clearTimeout(t1); 
      clearTimeout(t2); 
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('filmybro_user');
    setCurrentUser(null);
    navigate('/');
  };

  const handleAuthAction = async () => {
    if (isAuthLoading) return;
    const endpoint = modalType === 'login' ? '/api/auth/login' : '/api/auth/register';
    
    setIsAuthLoading(true);
    try {
      const payload = modalType === 'login' ? {
        name: authForm.username,
        password: authForm.password
      } : {
        name: authForm.username,
        email: authForm.email,
        age: authForm.age,
        password: authForm.password
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      const userData = { _id: data._id, name: data.name, email: data.email, age: data.age, token: data.token };
      localStorage.setItem('filmybro_user', JSON.stringify(userData));
      setCurrentUser(userData);
      setModalType(null);
      setAuthForm({ username: '', email: '', age: '', password: '' });
      toast.success(modalType === 'login' ? `Welcome back, ${data.name}!` : `Account created! Welcome, ${data.name}!`);
      navigate('/movies');
    } catch (err) {
      toast.dismiss();
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        toast.error('CRITICAL: Backend offline. Did you start mongod and node server.js?', { id: 'auth-error', duration: 5000 });
      } else {
        toast.error(err.message, { id: 'auth-error' });
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleProtectedNavigation = (e, targetPath) => {
    if (!currentUser) {
      e.preventDefault();
      setModalType('login');
    } else {
      navigate(targetPath);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030305] font-sans text-white overflow-hidden noise-bg">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brandRed/15 blur-[180px] rounded-full pointer-events-none animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] bg-cinemaCard/80 blur-[120px] rounded-full pointer-events-none animate-float" style={{ animationDelay: '2s' }} />


      {/* SPLASH SCREEN */}
      {showSplash && (
        <div 
          className="fixed inset-0 z-[200000] bg-black flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out" 
          style={{ opacity: splashOpacity }}
        >
          <div className="relative flex flex-col items-center">
            <div className="absolute top-0 w-28 h-28 rounded-full border border-red-600/30 animate-ping"></div>
            <img src={logo} className="w-28 h-28 rounded-full shadow-[0_0_60px_rgba(239,68,68,0.5)] relative z-10 border border-white/10" alt="logo" />
            <h1 className="mt-8 text-4xl font-black italic tracking-widest uppercase text-white relative z-10">FILMY<span className="text-red-600">BRO</span></h1>
            <p className="mt-3 text-[10px] uppercase tracking-[0.5em] font-bold text-zinc-500 animate-pulse relative z-10">Unlocking The Vault...</p>
          </div>
        </div>
      )}

      <Toaster position="top-center" toastOptions={{ style: { background: '#18181b', color: '#fff', border: '1px solid #3f3f46', fontSize: '12px', fontWeight: 'bold' } }} />

      {/* BACKGROUND GRID */}
      <div className={`fixed inset-0 z-0 grid grid-cols-2 md:grid-cols-6 h-full w-full transition-all duration-1000 ${(isMoviesPage || isTrendingPage || isBacklogPage) ? 'opacity-20 blur-md' : 'opacity-40'}`}>
        {(isAboutPage ? aboutPosters : homePosters).map((img, i) => (
          <div key={i} className="h-full w-full border-r border-white/5 overflow-hidden">
            <img src={img} className="h-full w-full object-cover" alt="" />
          </div>
        ))}
      </div>
      
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-[#030305]/80 via-transparent to-[#030305] pointer-events-none"></div>

      <div className="relative z-20 w-full min-h-screen">
        <header className="flex justify-center w-full sticky top-0 z-[100] bg-[#030305]/70 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] px-6 lg:px-10">
          <div className="flex items-center justify-between w-full max-w-[1600px] py-4">
            <Link to="/" className="flex items-center gap-5 group">
              <img src={logo} className="w-14 h-14 rounded-full border-2 border-brandRed shadow-2xl group-hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all" alt="logo" />
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black italic text-white group-hover:text-brandRed transition-colors">FILMY<span className="text-brandRed">BRO</span></span>
                <span className="text-[8px] tracking-[0.4em] uppercase text-gray-400 font-bold mt-1">ultimate film bro</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-2 premium-glass p-1.5 rounded-full z-50">
              <button onClick={(e) => handleProtectedNavigation(e, '/movies')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${location.pathname==='/movies'?'bg-brandRed text-white shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-105':'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105'}`}>MOVIES</button>
              <button onClick={(e) => handleProtectedNavigation(e, '/trending')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${location.pathname==='/trending'?'bg-brandRed text-white shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-105':'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105'}`}>TRENDING</button>
              <button onClick={(e) => handleProtectedNavigation(e, '/backlog')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${location.pathname==='/backlog'?'bg-brandRed text-white shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-105':'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105'}`}>THE BACKLOG</button>
              <button onClick={(e) => handleProtectedNavigation(e, '/reviews')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${location.pathname==='/reviews'?'bg-brandRed text-white shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-105':'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105'}`}>REVIEWS</button>
              <button onClick={(e) => handleProtectedNavigation(e, '/playlists')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${location.pathname==='/playlists'?'bg-brandRed text-white shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-105':'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105'}`}>BROLISTS</button>

              <Link to="/about" className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${location.pathname==='/about'?'bg-brandRed text-white shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-105':'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105'}`}>ABOUT US</Link>
            </nav>

            <div className="flex items-center gap-4">
              {!currentUser ? (
                <button onClick={() => setModalType('login')} className="px-8 py-3 bg-brandRed rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all hover:scale-105">Log In</button>
              ) : (
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 py-1.5 pl-3 pr-2 rounded-full backdrop-blur-md hover:bg-white/10 transition-all cursor-pointer">
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.name)}`} alt="Avatar" className="w-8 h-8 rounded-full bg-white/10 border border-white/20 shadow-inner" />
                  <span className="text-[11px] font-black uppercase italic tracking-wider text-white pr-2"><span className="text-brandRed">{currentUser.name}</span></span>
                  <button onClick={handleLogout} className="p-2 bg-brandRed/10 hover:bg-brandRed rounded-full text-brandRed hover:text-white transition-all shadow-sm"><LogOut size={16} /></button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={
              <div className="h-[80vh] flex flex-col items-center justify-center text-center px-6 relative z-10 w-full max-w-[1200px] mx-auto">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-600/10 blur-[120px] rounded-[100%] pointer-events-none mix-blend-screen" />
                <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter uppercase leading-[0.85] mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-700 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] filter relative z-10">
                  CINEPHILE'S <br/> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">SANCTUARY</span>
                </h1>
                <p className="text-sm md:text-base font-bold text-zinc-300 mb-14 uppercase tracking-[0.4em] max-w-xl leading-relaxed relative z-10">
                  The ultimate database for film bros. <span className="text-red-500">Log your takes</span>, track the backlog, and never watch a 5/10 movie again.
                </p>
                <div className="relative group cursor-pointer inline-block z-10" onClick={(e) => handleProtectedNavigation(e, '/movies')}>
                   <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-red-900 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition duration-700 group-hover:duration-200 animate-pulse-slow"></div>
                   <button className="relative px-16 py-6 bg-[#0a0a0a] border border-red-500/30 rounded-full font-black tracking-[0.3em] text-xs text-white group-hover:bg-black transition-all shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                     ENTER THE VAULT
                   </button>
                </div>
              </div>
            } />
            <Route path="/movies" element={currentUser ? <MoviesPage /> : <Navigate to="/" />} />
            <Route path="/trending" element={currentUser ? <TrendingPage /> : <Navigate to="/" />} />
            <Route path="/backlog" element={currentUser ? <BacklogPage /> : <Navigate to="/" />} />
            <Route path="/reviews" element={currentUser ? <ReviewsPage /> : <Navigate to="/" />} />
            <Route path="/playlists" element={currentUser ? <PlaylistsPage /> : <Navigate to="/" />} />

            <Route path="/about" element={
              <div className="flex flex-col items-center justify-center px-6 py-20">
                <div className="max-w-3xl w-full p-12 rounded-[50px] border border-white/10 bg-black/60 backdrop-blur-xl text-center mb-10">
                    <div className="mb-6 p-4 inline-block rounded-full bg-brandRed shadow-xl shadow-red-900/20"><Code size={40} className="text-white" /></div>
                    <h1 className="text-5xl md:text-6xl font-black uppercase italic mb-4 text-white">Pinto N <span className="text-brandRed">Sebastian</span></h1>
                    <p className="text-lg font-bold uppercase tracking-widest mb-4 text-gray-300">CSE Engineering @ Marian Engineering College</p>
                    <p className="italic opacity-70 text-white">"Blending the precision of software engineering with the soul of cinema..."</p>
                </div>
                <div className="text-center opacity-40 hover:opacity-100 transition-opacity">
                   <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">This product uses the <span className="text-brandRed">TMDB API</span> but is not endorsed or certified by TMDB.</p>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>

      {modalType && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-xl px-4 animate-fade-slide-in">
          <div className="w-full max-w-[420px] bg-[#070709] border border-white/10 p-12 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-600/20 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black italic uppercase text-center mb-2 text-white drop-shadow-lg">{modalType === 'login' ? 'WELCOME BACK' : 'JOIN THE BROS'}</h2>
              <p className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8">Authenticate Securely</p>
            
            <input 
              type="text" 
              placeholder="USERNAME" 
              value={authForm.username}
              onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 mb-4 outline-none focus:border-brandRed text-xs text-white" 
            />
            
            {modalType === 'signup' && (
              <>
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  value={authForm.email}
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 mb-4 outline-none focus:border-brandRed text-xs text-white" 
                />
                <input 
                  type="number" 
                  placeholder="AGE" 
                  value={authForm.age}
                  onChange={(e) => setAuthForm({...authForm, age: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 mb-4 outline-none focus:border-brandRed text-xs text-white" 
                />
              </>
            )}

            <input 
              type="password" 
              placeholder="PASSWORD" 
              value={authForm.password}
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 mb-8 outline-none focus:border-brandRed text-xs text-white" 
            />
            
            <button 
              onClick={handleAuthAction} 
              disabled={isAuthLoading}
              className="w-full py-5 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(225,29,72,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isAuthLoading ? 'PLEASE WAIT...' : (modalType === 'login' ? 'ENTER THE VAULT' : 'SIGN UP NOW')}
            </button>
            
            <div className="flex flex-col gap-4 mt-8 items-center border-t border-white/5 pt-6">
                <button 
                  onClick={() => { setModalType(modalType === 'login' ? 'signup' : 'login'); setAuthForm({ username: '', email: '', age: '', password: '' }); }} 
                  className="text-[10px] text-zinc-400 uppercase font-bold hover:text-white transition-colors tracking-widest"
                >
                  {modalType === 'login' ? "New here? Create Account" : "Already registered? Login"}
                </button>
                <button onClick={() => setModalType(null)} className="text-[10px] text-zinc-600 uppercase font-bold hover:text-red-500 transition-colors tracking-widest flex items-center gap-1">
                  <X size={12} /> Cancel
                </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;