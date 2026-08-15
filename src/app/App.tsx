
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppleGame } from './components/AppleGame';
import { CrashGame } from './components/CrashGame';
import { MinesGame } from './components/MinesGame';
import { WildWestGame } from './components/WildWestGame';
import { Login } from './components/Login';
import { Profile } from './components/Profile';
import { Notifications } from './components/Notifications';
import { AboutDev } from './components/AboutDev';
import { UsersOnline } from './components/UsersOnline';
import { ChatSupport } from './components/ChatSupport';
import { LiveAnalytics } from './components/LiveAnalytics';
import { GetCode } from './components/GetCode';
import { ViewState, AccessKey, Notification, Language, UserProfile } from './types';
import { LayoutGrid, Rocket, Bomb, Cpu, Zap, Bell, ChevronRight, User, Users, Activity, Database, Crosshair, MessageSquare, Sparkles, Home, Loader2, Trophy, Crown, Medal, Shield, Lock, Wrench, Ghost, Skull, Bot, Smile, Hash, Copy, Check, X, Server, Gamepad2, Scan, Fingerprint, Binary, Command, Hexagon, ShieldCheck, Radio, Key, Flame, Star, Target, Eye } from 'lucide-react';
import { playSound } from './services/audio';
import { fetchNotifications } from './services/database';
import { verifyAccessKey } from './services/auth';
import { translations } from './translations';

const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;

const PLAYER_NAMES = [
    "Ghost_Rider", "Ahmed_VIP", "Crypto_King", "Alex_Sniper", "Saudi_Prince", 
    "Falcon_Eye", "Desert_Fox", "Lucky_Strike", "Shadow_Hunter", "Golden_Boy",
    "Elite_Trader", "Pro_Gamer_99", "Midas_Touch", "Cyber_Wolf", "Night_Owl"
];

const AVATARS = [
    { id: 0, icon: User, color: 'text-zinc-400', bg: 'bg-zinc-800' },
    { id: 1, icon: Ghost, color: 'text-purple-400', bg: 'bg-purple-900/40' },
    { id: 2, icon: Skull, color: 'text-red-400', bg: 'bg-red-900/40' },
    { id: 3, icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-900/40' },
    { id: 4, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-900/40' },
    { id: 5, icon: Bot, color: 'text-green-400', bg: 'bg-green-900/40' },
    { id: 6, icon: Smile, color: 'text-pink-400', bg: 'bg-pink-900/40' },
    { id: 7, icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-900/40' },
    { id: 8, icon: Gamepad2, color: 'text-orange-400', bg: 'bg-orange-900/40' },
    { id: 9, icon: Rocket, color: 'text-red-500', bg: 'bg-red-900/40' },
    { id: 10, icon: Flame, color: 'text-amber-500', bg: 'bg-amber-900/40' },
    { id: 11, icon: Star, color: 'text-yellow-300', bg: 'bg-yellow-900/40' },
    { id: 12, icon: Target, color: 'text-red-400', bg: 'bg-red-900/40' },
    { id: 13, icon: Cpu, color: 'text-cyan-400', bg: 'bg-cyan-900/40' },
    { id: 14, icon: Fingerprint, color: 'text-violet-400', bg: 'bg-violet-900/40' },
    { id: 15, icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-900/40' },
];

const AVATAR_CONFIGS = [
    { color: "from-zinc-400 to-zinc-600", border: "border-zinc-400", bg: "bg-zinc-800" }, // Silver/Grey
    { color: "from-yellow-400 to-yellow-600", border: "border-yellow-400", bg: "bg-yellow-500/10" }, // Gold
    { color: "from-orange-400 to-orange-600", border: "border-orange-500", bg: "bg-orange-900/20" }, // Bronze
    { color: "from-purple-400 to-purple-600", border: "border-purple-500", bg: "bg-purple-900/20" },
    { color: "from-blue-400 to-blue-600", border: "border-blue-500", bg: "bg-blue-900/20" },
    { color: "from-green-400 to-green-600", border: "border-green-500", bg: "bg-green-900/20" },
    { color: "from-red-400 to-red-600", border: "border-red-500", bg: "bg-red-900/20" },
];

// Generate fake hashes for the modal
const MOCK_HASHES = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    timestamp: Date.now() - (i * 1000 * 60 * 15), // Every 15 mins
    active: i === 0
}));

const BOOT_SEQUENCE = [
    "LOADING BIOMETRIC MODULES...",
    "ESTABLISHING SECURE LINK...",
    "VERIFYING INTEGRITY...",
    "SYNCING MATRIX...",
    "ACCESS GRANTED."
];

export const App: React.FC = () => {
  // Initialize Access Key state immediately from local storage
  const [accessKeyData, setAccessKeyData] = useState<AccessKey | null>(() => {
      try {
          const saved = localStorage.getItem('access_key_data');
          return saved ? JSON.parse(saved) : null;
      } catch { return null; }
  });

  // Initialize User Profile from Local Storage
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
      try {
          const saved = localStorage.getItem('user_profile_data');
          if (saved) return JSON.parse(saved);
      } catch { }
      
      return {
          username: accessKeyData?.name || 'Operator',
          joinDate: Date.now(),
          stats: {
            gamesPlayed: 3,
            totalWinnings: Math.floor(Math.random() * 5000),
            rank: 'Rookie',
            trustScore: 100
          },
          preferences: {
            notifications: true,
            sound: true,
            haptics: true,
            showBalance: true
          }
      };
  });

  // Sync profile to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('user_profile_data', JSON.stringify(userProfile));
  }, [userProfile]);

  const updateUserProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
  };

  // Initialize view based on auth status - Skip 'SPLASH'
  const [view, setView] = useState<ViewState>(() => {
      try {
          return localStorage.getItem('access_key_data') ? 'SELECTION' : 'LOGIN';
      } catch { return 'LOGIN'; }
  });
  
  // App Startup Splash State
  const [isStartupLoading, setIsStartupLoading] = useState(true);
  const [bootLogIndex, setBootLogIndex] = useState(0);
  const [bootProgress, setBootProgress] = useState(0);
  
  // Game Loading State (The only Splash Screen now)
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [loadingGameTitle, setLoadingGameTitle] = useState("");
  const [loadingGameKey, setLoadingGameKey] = useState<ViewState | null>(null);
  const [gameLoadProgress, setGameLoadProgress] = useState(0);

  // Server Hash Modal State
  const [isHashModalOpen, setIsHashModalOpen] = useState(false);
  const [copiedHashId, setCopiedHashId] = useState<number | null>(null);

  // Ref to track view state inside intervals without resetting them
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; }, [view]);

  // Handle Startup Splash
  useEffect(() => {
    const totalDuration = 2500;
    const intervalTime = totalDuration / BOOT_SEQUENCE.length;

    const logInterval = setInterval(() => {
        setBootLogIndex(prev => {
            if (prev < BOOT_SEQUENCE.length - 1) return prev + 1;
            return prev;
        });
    }, intervalTime);

    const progressInterval = setInterval(() => {
        setBootProgress(prev => {
            if (prev >= 100) return 100;
            return prev + (100 / (totalDuration / 20));
        });
    }, 20);

    const timer = setTimeout(() => {
        setIsStartupLoading(false);
        clearInterval(logInterval);
        clearInterval(progressInterval);
    }, totalDuration);

    return () => {
        clearTimeout(timer);
        clearInterval(logInterval);
        clearInterval(progressInterval);
    };
  }, []);

  // Language State - Default to English
  const [language, setLanguage] = useState<Language>(() => {
      try {
          return (localStorage.getItem('app_language') as Language) || 'en';
      } catch { return 'en'; }
  });

  const changeLanguage = (lang: Language) => {
      setLanguage(lang);
      localStorage.setItem('app_language', lang);
      playSound('click');
  };

  const t = translations[language];

  // Font class based on language
  const getFontClass = () => {
      switch(language) {
          case 'ar': return 'font-ar';
          default: return 'font-en';
      }
  };
  
  // Avatar State
  const [userAvatarId, setUserAvatarId] = useState<number>(() => {
      try {
          return parseInt(localStorage.getItem('user_avatar_id') || '0', 10);
      } catch { return 0; }
  });

  const handleAvatarChange = (id: number) => {
      setUserAvatarId(id);
      localStorage.setItem('user_avatar_id', id.toString());
      playSound('click');
  };

  // Dashboard Realism State
  const [metrics, setMetrics] = useState({
      luck: 65,
      signal: 82,
      volatility: 35,
      users: 1240,
      serverLoad: 4829103921 // Initial 10-digit number
  });

  // Top Players State
  const [topPlayers, setTopPlayers] = useState([
      { name: "Ghost_Rider", profit: "$84,290", rank: 2, avatar: 2, ...AVATAR_CONFIGS[0] },
      { name: "Ahmed_VIP", profit: "$142,500", rank: 1, avatar: 3, ...AVATAR_CONFIGS[1] },
      { name: "Crypto_King", profit: "$63,100", rank: 3, avatar: 4, ...AVATAR_CONFIGS[2] },
  ]);

  // Top Players Rotation Effect (Every 1 Minute)
  useEffect(() => {
      const rotatePlayers = () => {
          const shuffledNames = [...PLAYER_NAMES].sort(() => 0.5 - Math.random());
          const newPlayers = [
              { 
                  name: shuffledNames[0], 
                  profit: `$${(Math.random() * 50000 + 40000).toLocaleString('en-US', {maximumFractionDigits: 0})}`, 
                  rank: 2, 
                  avatar: Math.floor(Math.random() * 8), 
                  ...AVATAR_CONFIGS[0] // Silver
              },
              { 
                  name: shuffledNames[1], 
                  profit: `$${(Math.random() * 100000 + 100000).toLocaleString('en-US', {maximumFractionDigits: 0})}`, 
                  rank: 1, 
                  avatar: Math.floor(Math.random() * 8), 
                  ...AVATAR_CONFIGS[1] // Gold
              },
              { 
                  name: shuffledNames[2], 
                  profit: `$${(Math.random() * 30000 + 20000).toLocaleString('en-US', {maximumFractionDigits: 0})}`, 
                  rank: 3, 
                  avatar: Math.floor(Math.random() * 8), 
                  ...AVATAR_CONFIGS[2] // Bronze
              },
          ];
          setTopPlayers(newPlayers);
      };

      const interval = setInterval(rotatePlayers, 60000); // 1 minute
      return () => clearInterval(interval);
  }, []);

  // Notification System State - Filtered only for Admin/Dev
  const [notifications, setNotifications] = useState<Notification[]>([
      {
          id: '1',
          title: 'System Welcome',
          message: 'Welcome to EL HETAN V1. Official developer channel established.',
          timestamp: Date.now(),
          type: 'info',
          sender: 'Administrator',
          read: false
      }
  ]);
  const [latestToast, setLatestToast] = useState<Notification | null>(null);

  // Dynamic Dashboard Data Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics(prev => ({
            luck: Math.min(98, Math.max(15, prev.luck + (Math.random() * 20 - 10))),
            signal: Math.min(99, Math.max(40, prev.signal + (Math.random() * 10 - 5))),
            volatility: Math.min(90, Math.max(10, prev.volatility + (Math.random() * 30 - 15))),
            users: Math.floor(prev.users + (Math.random() * 12 - 5)),
            serverLoad: Math.floor(prev.serverLoad + (Math.random() * 50000 - 25000))
        }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Automatic Push Notification Simulation (Every 1 minute)
  useEffect(() => {
    const timer = setInterval(() => {
        // Use ref to check view without adding it to dependencies (prevents reset)
        const currentView = viewRef.current;
        if (currentView === 'SPLASH' || currentView === 'LOGIN' || isStartupLoading) return;

        const templates = [
            { tKey: 'notif_marketUpdate', mKey: 'notif_msg_volatility', type: 'warning' },
            { tKey: 'notif_systemOpt', mKey: 'notif_msg_signal', type: 'success' },
            { tKey: 'notif_patternDetected', mKey: 'notif_msg_safePath', type: 'info' },
            { tKey: 'notif_securityAlert', mKey: 'notif_msg_bot', type: 'warning' }
        ];

        const template = templates[Math.floor(Math.random() * templates.length)];
        
        const newNotif: Notification = {
            id: `auto-${Date.now()}`,
            title: 'System Alert', 
            message: 'New system event detected.', 
            titleKey: template.tKey,
            messageKey: template.mKey,
            timestamp: Date.now(),
            type: template.type as any,
            read: false,
            sender: 'System AI'
        };

        setNotifications(prev => {
            const updated = [newNotif, ...prev].slice(0, 50);
            return updated;
        });

        // Only show toast if not in notification view
        if (currentView !== 'NOTIFICATIONS') {
            setLatestToast(newNotif);
            playSound('toggle');
            setTimeout(() => setLatestToast(null), 2000); // Auto hide after 2 seconds
        }

    }, 60000); // 1 minute

    return () => clearInterval(timer);
  }, [isStartupLoading]); 

  // Firebase Notification Integration
  const processedFirebaseIds = useRef<Set<string>>(new Set());
  const isFirstFetch = useRef(true);

  useEffect(() => {
    const pollFirebaseNotifications = async () => {
        const notes = await fetchNotifications();
        if (notes) {
            const newNotes: Notification[] = [];
            const fetchedIds = new Set(Object.keys(notes));
            
            Object.entries(notes).forEach(([key, note]: [string, any]) => {
                if (!processedFirebaseIds.current.has(key)) {
                    processedFirebaseIds.current.add(key);
                    
                    newNotes.push({
                        id: key,
                        title: note.title || 'Administrator',
                        message: note.description || note.message || 'New update available',
                        description: note.description && note.message ? note.message : undefined,
                        timestamp: note.timestamp || Date.now(),
                        type: note.type || 'info',
                        sender: note.sender || 'Administrator',
                        read: false
                    });
                }
            });

            setNotifications(prev => {
                const filtered = prev.filter(n => {
                    if (processedFirebaseIds.current.has(n.id)) {
                        return fetchedIds.has(n.id);
                    }
                    return true;
                });
                
                const final = [...newNotes, ...filtered];
                return final.sort((a, b) => b.timestamp - a.timestamp);
            });
            
            processedFirebaseIds.current = new Set([...processedFirebaseIds.current].filter(id => fetchedIds.has(id)));

            if (newNotes.length > 0) {
                const currentView = viewRef.current;
                if (!isFirstFetch.current && currentView !== 'NOTIFICATIONS' && currentView !== 'LOGIN' && currentView !== 'SPLASH') {
                    setLatestToast(newNotes[newNotes.length - 1]);
                    playSound('toggle');
                    setTimeout(() => setLatestToast(null), 2000); // Auto hide after 2 seconds
                }
            }
            isFirstFetch.current = false;
        }
    };

    const interval = setInterval(pollFirebaseNotifications, 10000); 
    pollFirebaseNotifications(); 

    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      playSound('click');
  };

  const handleMarkAllRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      playSound('success');
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLoginSuccess = (data: AccessKey) => {
      setAccessKeyData(data);
      // Update profile name if it was just "Operator"
      if (userProfile.username === 'Operator' && data.name) {
          setUserProfile(prev => ({...prev, username: data.name || 'Operator'}));
      }
      setView('SELECTION');
  };

  const handleSignOut = () => {
      localStorage.removeItem('access_key_data');
      setAccessKeyData(null);
      setView('LOGIN');
  };

  useEffect(() => {
    if (!accessKeyData) return;

    const checkKeyStatus = async () => {
        // 1. Immediate Local Timeout Check
        // If the key has an expiry date and we have passed it, logout immediately.
        if (accessKeyData.type !== 'PERMANENT' && accessKeyData.expiresAt) {
            if (Date.now() > accessKeyData.expiresAt) {
                handleSignOut();
                setLatestToast({
                    id: 'session-timeout',
                    title: t.notif_securityAlert,
                    message: language === 'ar' ? "انتهت صلاحية الجلسة" : "Session Expired",
                    timestamp: Date.now(),
                    type: 'warning',
                    read: false,
                    sender: 'System'
                });
                return; // Stop further checks
            }
        }

        // 2. Server Validation Check (Checks for "Blocked", "Disabled", or "Deleted" keys)
        const result = await verifyAccessKey(accessKeyData.key);
        
        if (!result.valid) {
            const isNetworkError = result.error?.includes("Connection");
            
            // Only redirect if it's NOT a network error to avoid false positives on bad internet
            if (!isNetworkError) {
                handleSignOut();
                
                const msg = result.error === "Key has been disabled." 
                    ? (language === 'ar' ? "تم تعطيل الحساب" : "Account Blocked")
                    : (language === 'ar' ? "المفتاح غير صالح" : "Invalid Access Key");

                setLatestToast({
                    id: 'session-terminated',
                    title: t.notif_securityAlert,
                    message: msg,
                    timestamp: Date.now(),
                    type: 'warning',
                    read: false,
                    sender: 'Administrator'
                });
                
                playSound('crash');
            }
        }
    };

    // Check frequently (every 2 seconds) to ensure immediate redirect on block/timeout
    const interval = setInterval(checkKeyStatus, 2000);
    return () => clearInterval(interval);
  }, [accessKeyData, language, t]);

  const selectGame = (game: ViewState) => {
      playSound('click');

      // Views that navigate instantly without splash screen
      const instantViews: ViewState[] = ['SELECTION', 'PROFILE', 'NOTIFICATIONS', 'USERS_ONLINE', 'CHAT_SUPPORT', 'ABOUT_DEV', 'LIVE_ANALYTICS', 'GET_CODE'];

      if (instantViews.includes(game)) {
          setView(game);
          return;
      }

      let title = "";
      switch (game) {
          case 'APPLE': title = "APPLE FORTUNE"; break;
          case 'CRASH': title = "CRASH PREDICTOR"; break;
          case 'MINES': title = "MINES AI"; break;
          case 'WILD_WEST': title = "WILD WEST"; break;
          default: title = "LOADING MODULE";
      }

      setLoadingGameTitle(title);
      setLoadingGameKey(game);
      setIsGameLoading(true);
      setGameLoadProgress(0);

      // Simulate loading progress
      let progress = 0;
      const interval = setInterval(() => {
          progress += Math.random() * 25; // Faster loading
          if (progress > 100) progress = 100;
          setGameLoadProgress(progress);
      }, 50);

      setTimeout(() => {
          clearInterval(interval);
          setGameLoadProgress(100);
          setView(game);
          setIsGameLoading(false);
          setLoadingGameKey(null);
      }, 1200); // 1.2 seconds loading delay (Faster)
  };

  const copyHash = (hash: string, id: number) => {
      navigator.clipboard.writeText(hash);
      setCopiedHashId(id);
      playSound('click');
      setTimeout(() => setCopiedHashId(null), 2000);
  };

  const showBottomNav = ['SELECTION', 'PROFILE', 'NOTIFICATIONS', 'ABOUT_DEV', 'USERS_ONLINE'].includes(view);

  // Helper to get loading text based on progress
  const getLoadingText = (progress: number) => {
      if (progress < 20) return "Handshaking Secure Protocol...";
      if (progress < 40) return "Decrypting Server Hash...";
      if (progress < 60) return "Syncing Probability Matrix...";
      if (progress < 80) return "Optimizing Latency Route...";
      if (progress < 95) return "Verifying Integrity...";
      return "Launch Imminent.";
  };

  const renderContent = () => {
    // Determine avatar for the header
    const currentAvatar = AVATARS.find(a => a.id === userAvatarId) || AVATARS[0];
    const UserAvatarIcon = currentAvatar.icon;

    switch (view) {
        case 'PROFILE':
            return <Profile 
                accessKeyData={accessKeyData} 
                userProfile={userProfile}
                onUpdateProfile={updateUserProfile}
                onSignOut={handleSignOut} 
                onNavigate={selectGame} 
                currentAvatarId={userAvatarId} 
                onAvatarChange={handleAvatarChange} 
                language={language} 
                onLanguageChange={changeLanguage} 
            />;
        case 'ABOUT_DEV':
            return <AboutDev onBack={() => setView('PROFILE')} language={language} />;
        case 'NOTIFICATIONS':
            return <Notifications notifications={notifications} onMarkRead={handleMarkRead} onMarkAllRead={handleMarkAllRead} language={language} />;
        case 'USERS_ONLINE':
            return <UsersOnline onBack={() => setView('SELECTION')} language={language} onLanguageChange={changeLanguage} activeUserCount={metrics.users} />;
        case 'LIVE_ANALYTICS':
            return <LiveAnalytics onBack={() => setView('SELECTION')} language={language} activeUserCount={metrics.users} />;
        case 'GET_CODE':
            return <GetCode onBack={() => { playSound('click'); setView('LOGIN'); }} language={language} />;
        case 'APPLE':
            return <AppleGame onBack={() => { playSound('click'); setView('SELECTION'); }} accessKeyData={accessKeyData} language={language} />;
        case 'CRASH':
            return <CrashGame onBack={() => { playSound('click'); setView('SELECTION'); }} accessKeyData={accessKeyData} language={language} />;
        case 'MINES':
            return <MinesGame onBack={() => { playSound('click'); setView('SELECTION'); }} accessKeyData={accessKeyData} language={language} />;
        case 'WILD_WEST':
            return <WildWestGame onBack={() => { playSound('click'); setView('SELECTION'); }} accessKeyData={accessKeyData} language={language} />;
        case 'CHAT_SUPPORT':
            return <ChatSupport onBack={() => { playSound('click'); setView('SELECTION'); }} language={language} accessKeyData={accessKeyData} userAvatarId={userAvatarId} />;
        case 'SELECTION':
        default:
            return (
                <MotionDiv
                    key="selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col pb-24 overflow-y-auto"
                >
                    <header className="flex items-center justify-between mb-4 pt-4 px-4">
                        <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => { playSound('click'); selectGame('PROFILE'); }}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-lg relative group-hover:border-green-500/50 transition-colors overflow-hidden">
                                <div className={`absolute inset-0 ${currentAvatar.bg} opacity-20`} />
                                <UserAvatarIcon className={`w-5 h-5 ${currentAvatar.color} relative z-10 group-hover:scale-110 transition-transform`} />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#09090b] rounded-full z-20"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider group-hover:text-green-500 transition-colors">{t.welcomeBack}</span>
                                <span className="text-sm font-bold text-white">{userProfile.username}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <div 
                                className="relative p-2 rounded-full bg-zinc-900 border border-white/5 hover:bg-zinc-800 cursor-pointer transition-all active:scale-95"
                                onClick={() => { playSound('click'); selectGame('NOTIFICATIONS'); }}
                             >
                                 <Bell className="w-5 h-5 text-zinc-400" />
                                 {unreadCount > 0 && (
                                     <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#09090b] flex items-center justify-center">
                                         <span className="text-[8px] font-bold text-white">{unreadCount > 9 ? '!' : unreadCount}</span>
                                     </div>
                                 )}
                             </div>
                        </div>
                    </header>

                    <div className="px-4 mb-4 grid grid-cols-2 gap-3">
                         <div 
                            onClick={() => { playSound('click'); selectGame('USERS_ONLINE'); }}
                            className="bg-[#121214] border border-white/5 p-3 rounded-2xl flex flex-col gap-2 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors"
                        >
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-1.5 text-zinc-500">
                                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                     <span className="text-[9px] font-bold uppercase tracking-wider">{t.onlineUsers}</span>
                                 </div>
                             </div>
                             <div className="text-xl font-black text-white tabular-nums tracking-tight">
                                 {metrics.users.toLocaleString()}
                             </div>
                             <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-auto">
                                 <MotionDiv 
                                    className="h-full bg-green-500" 
                                    animate={{ width: `${Math.random() * 40 + 40}%` }}
                                    transition={{ duration: 2 }}
                                 />
                             </div>
                         </div>
                         
                         <div 
                            onClick={() => { playSound('click'); setIsHashModalOpen(true); }}
                            className="bg-[#121214] border border-white/5 p-3 rounded-2xl flex flex-col gap-1 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors"
                         >
                             <div className="flex items-center justify-between mb-1">
                                 <div className="flex items-center gap-1.5 text-zinc-500">
                                     <Database className="w-3 h-3" />
                                     <span className="text-[9px] font-bold uppercase tracking-wider">{t.serverHash}</span>
                                 </div>
                                 <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
                             </div>
                             
                             <div className="text-sm font-black text-white tabular-nums tracking-tighter font-mono bg-zinc-900/50 p-1 rounded border border-white/5 text-center truncate px-2">
                                 {MOCK_HASHES[0].hash.substring(0, 12)}...
                             </div>
                             
                             <div className="text-[8px] text-zinc-500 font-mono mt-auto text-right w-full">
                                 Tap to view all
                             </div>
                         </div>
                    </div>

                    <div 
                        onClick={() => selectGame('LIVE_ANALYTICS')}
                        className="mb-6 mx-4 p-5 rounded-3xl bg-gradient-to-b from-[#151518] to-[#0c0c0e] border border-white/5 shadow-2xl relative overflow-hidden group cursor-pointer hover:border-green-500/20 transition-all"
                    >
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-purple-500" />
                                {t.liveAnalytics}
                            </h2>
                            <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] font-bold text-green-500 uppercase tracking-wide">
                                    {t.systemActive}
                                </span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-2 relative z-10 h-32">
                             <div className="flex flex-col gap-2 h-full">
                                 <div className="flex-1 bg-zinc-900/50 rounded-xl relative overflow-hidden flex items-end p-1.5 border border-white/5">
                                     <MotionDiv 
                                        animate={{ height: `${metrics.luck}%` }} 
                                        transition={{ type: "spring", bounce: 0, duration: 1.5 }}
                                        className="w-full bg-gradient-to-t from-purple-500/10 to-purple-500/40 border-t border-purple-500/50 rounded-lg relative group"
                                     >
                                        <div className="absolute inset-x-0 top-0 h-[1px] bg-purple-400 shadow-[0_0_15px_#a855f7]" />
                                     </MotionDiv>
                                 </div>
                                 <div className="flex flex-col items-center">
                                     <span className="text-[9px] text-zinc-500 font-bold uppercase">{t.luck}</span>
                                     <span className="text-[10px] font-mono text-purple-400">{Math.round(metrics.luck)}%</span>
                                 </div>
                             </div>
                             
                             <div className="flex flex-col gap-2 h-full">
                                 <div className="flex-1 bg-zinc-900/50 rounded-xl relative overflow-hidden flex items-end p-1.5 border border-white/5">
                                     <MotionDiv 
                                        animate={{ height: `${metrics.signal}%` }} 
                                        transition={{ type: "spring", bounce: 0, duration: 1.5 }}
                                        className="w-full bg-gradient-to-t from-green-500/10 to-green-500/40 border-t border-green-500/50 rounded-lg relative"
                                     >
                                         <div className="absolute inset-x-0 top-0 h-[1px] bg-green-400 shadow-[0_0_15px_#22c55e]" />
                                     </MotionDiv>
                                 </div>
                                 <div className="flex flex-col items-center">
                                     <span className="text-[9px] text-zinc-500 font-bold uppercase">{t.signal}</span>
                                     <span className="text-[10px] font-mono text-green-400">{Math.round(metrics.signal)}%</span>
                                 </div>
                             </div>
                             
                             <div className="flex flex-col gap-2 h-full">
                                 <div className="flex-1 bg-zinc-900/50 rounded-xl relative overflow-hidden flex items-end p-1.5 border border-white/5">
                                     <MotionDiv 
                                        animate={{ height: `${metrics.volatility}%` }} 
                                        transition={{ type: "spring", bounce: 0, duration: 1.5 }}
                                        className="w-full bg-gradient-to-t from-blue-500/10 to-blue-500/40 border-t border-blue-500/50 rounded-lg relative"
                                     >
                                         <div className="absolute inset-x-0 top-0 h-[1px] bg-blue-400 shadow-[0_0_15px_#3b82f6]" />
                                     </MotionDiv>
                                 </div>
                                 <div className="flex flex-col items-center">
                                     <span className="text-[9px] text-zinc-500 font-bold uppercase">{t.volatility}</span>
                                     <span className="text-[10px] font-mono text-blue-400">{Math.round(metrics.volatility)}%</span>
                                 </div>
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 px-4 pb-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-bold text-white tracking-wide">{t.availableModules}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* APPLE GAME */}
                            <button 
                                onClick={() => selectGame('APPLE')}
                                className="group relative h-28 rounded-2xl bg-[#121214] border border-white/5 hover:border-green-500/50 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative h-full flex flex-col justify-between p-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform shadow-lg">
                                        <LayoutGrid className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-black text-white text-sm tracking-wide">{t.appleFortune}</h4>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                            <p className="text-[9px] text-green-400 font-bold uppercase tracking-wider">{t.online}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                                </div>
                            </button>

                            {/* CRASH GAME */}
                            <button 
                                onClick={() => selectGame('CRASH')}
                                className="group relative h-28 rounded-2xl bg-[#121214] border border-white/5 hover:border-orange-500/50 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative h-full flex flex-col justify-between p-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shadow-lg">
                                        <Rocket className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-black text-white text-sm tracking-wide">{t.crashPredictor}</h4>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                                            <p className="text-[9px] text-orange-400 font-bold uppercase tracking-wider">{t.hot}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                                </div>
                            </button>

                            {/* MINES GAME */}
                            <button 
                                onClick={() => selectGame('MINES')}
                                className="group relative h-28 rounded-2xl bg-[#121214] border border-white/5 hover:border-blue-500/50 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative h-full flex flex-col justify-between p-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-lg">
                                        <Bomb className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-black text-white text-sm tracking-wide">{t.minesAi}</h4>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">{t.stable}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                                </div>
                            </button>

                            {/* WILD WEST GAME - MAINTENANCE */}
                            <button 
                                onClick={() => selectGame('WILD_WEST')}
                                className="group relative h-28 rounded-2xl bg-[#121214] border border-white/5 hover:border-orange-500/30 transition-all duration-300 overflow-hidden shadow-xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative h-full flex flex-col justify-between p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center text-orange-500 group-hover:text-orange-500 group-hover:scale-110 transition-all shadow-lg">
                                            <Crosshair className="w-5 h-5" />
                                        </div>
                                    </div>
                                    
                                    <div className="text-left">
                                        <h4 className="font-black text-zinc-400 group-hover:text-white transition-colors text-sm tracking-wide">Wild West</h4>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                                            <p className="text-[9px] text-orange-500 font-bold uppercase tracking-wider">MAINTENANCE</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                                </div>
                            </button>
                        </div>

                        {/* CHAT SUPPORT CARD */}
                        <button 
                            onClick={() => selectGame('CHAT_SUPPORT')}
                            className="group relative h-20 w-full rounded-2xl bg-[#121214] border border-white/5 hover:border-green-500/30 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] mt-3"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative h-full flex items-center px-5 gap-4">
                                <div className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform shadow-lg">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-white text-sm tracking-wide">{t.chatSupport}</h4>
                                        <span className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{t.chatOnline}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 text-[9px] font-bold text-green-500 uppercase">24/7</span>
                                        <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Top 3 Users Section */}
                    <AnimatePresence mode="wait">
                    <div className="mx-4 mb-4 mt-auto">
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <h3 className="text-sm font-bold text-white tracking-wide">{t.topPlayers}</h3>
                        </div>
                        
                        <div className="flex items-end justify-center gap-2">
                             {/* Rank 2 */}
                             <MotionDiv 
                                key={`rank2-${topPlayers[0].name}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center w-1/3"
                             >
                                 <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${topPlayers[0].color} p-0.5 relative mb-2 shadow-lg`}>
                                     <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                                        <User className="w-5 h-5 text-zinc-400" />
                                     </div>
                                     <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold text-zinc-300">2</div>
                                 </div>
                                 <div className={`w-full bg-gradient-to-t ${topPlayers[0].bg} to-transparent border-t border-x ${topPlayers[0].border} rounded-t-lg h-16 flex flex-col items-center justify-end pb-2`}>
                                     <span className="text-[10px] font-bold text-white truncate max-w-full px-1">{topPlayers[0].name}</span>
                                     <span className="text-[9px] font-mono text-zinc-400">{topPlayers[0].profit}</span>
                                 </div>
                             </MotionDiv>

                             {/* Rank 1 */}
                             <MotionDiv 
                                key={`rank1-${topPlayers[1].name}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="flex flex-col items-center w-1/3 z-10"
                             >
                                 <div className="relative mb-2">
                                     <Crown className="w-6 h-6 text-yellow-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                                     <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${topPlayers[1].color} p-0.5 relative shadow-[0_0_20px_rgba(234,179,8,0.5)]`}>
                                         <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                                            <Crown className="w-7 h-7 text-yellow-500" />
                                         </div>
                                         <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-500 border border-yellow-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black text-black shadow-lg">1</div>
                                     </div>
                                 </div>
                                 <div className={`w-full bg-gradient-to-t ${topPlayers[1].bg} to-transparent border-t border-x ${topPlayers[1].border} rounded-t-xl h-24 flex flex-col items-center justify-end pb-3 shadow-[0_-5px_20px_rgba(234,179,8,0.1)]`}>
                                     <span className="text-xs font-black text-white truncate max-w-full px-1">{topPlayers[1].name}</span>
                                     <span className="text-[10px] font-mono text-yellow-400 font-bold">{topPlayers[1].profit}</span>
                                 </div>
                             </MotionDiv>

                             {/* Rank 3 */}
                             <MotionDiv 
                                key={`rank3-${topPlayers[2].name}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="flex flex-col items-center w-1/3"
                             >
                                 <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${topPlayers[2].color} p-0.5 relative mb-2 shadow-lg`}>
                                     <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                                        <Medal className="w-5 h-5 text-orange-400" />
                                     </div>
                                     <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-900 border border-orange-700 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold text-orange-300">3</div>
                                 </div>
                                 <div className={`w-full bg-gradient-to-t ${topPlayers[2].bg} to-transparent border-t border-x ${topPlayers[2].border} rounded-t-lg h-12 flex flex-col items-center justify-end pb-2`}>
                                     <span className="text-[10px] font-bold text-white truncate max-w-full px-1">{topPlayers[2].name}</span>
                                     <span className="text-[9px] font-mono text-zinc-400">{topPlayers[2].profit}</span>
                                 </div>
                             </MotionDiv>
                        </div>
                    </div>
                    </AnimatePresence>

                </MotionDiv>
            );
    }
  };

  return (
    <div className={`min-h-screen bg-[#09090b] text-white overflow-x-hidden selection:bg-green-500/30 ${getFontClass()}`}>
      
      {/* REDESIGNED STARTUP SPLASH SCREEN (Minimalist High-Tech) */}
      <AnimatePresence>
        {isStartupLoading && (
             <MotionDiv
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className={`fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden ${getFontClass()}`}
             >
                 {/* Cinematic Void Background */}
                 <div className="absolute inset-0 bg-[#000000]" />
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.05)_0%,transparent_50%)]" />

                 {/* Central Identity Module */}
                 <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-xs">
                     
                     {/* Logo Reveal */}
                     <motion.div 
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative mb-8"
                     >
                         <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#121214] to-[#000000] border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.15)] relative overflow-hidden group">
                             <img 
                                src="https://image2url.com/images/1764758379533-1ae857ea-7b7e-4472-bbca-b12e4553cd7f.jpg" 
                                alt="EH V1" 
                                className="w-full h-full object-cover opacity-90 grayscale group-hover:grayscale-0 transition-all duration-700"
                             />
                             {/* Scan Line */}
                             <motion.div
                                className="absolute inset-x-0 h-[2px] bg-green-500/50 shadow-[0_0_10px_#22c55e]"
                                animate={{ top: ["0%", "100%"] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                             />
                         </div>
                     </motion.div>

                     {/* Text & Typography */}
                     <div className="text-center space-y-4 mb-10">
                         <motion.h1 
                            initial={{ opacity: 0, letterSpacing: "0em" }}
                            animate={{ opacity: 1, letterSpacing: "0.2em" }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                            className="text-5xl font-black text-white font-[Ethnocentric] drop-shadow-xl"
                         >
                             EH V1
                         </motion.h1>
                         
                         <div className="flex flex-col items-center gap-1">
                             <div className="h-[1px] w-12 bg-green-500/50" />
                             <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">
                                 Quantum Prediction Engine
                             </span>
                         </div>
                     </div>

                     {/* Loading Bar & Logs */}
                     <div className="w-full space-y-3">
                         <div className="flex justify-between items-end px-1">
                             <span className="text-[8px] font-mono text-green-500/80 uppercase tracking-wider animate-pulse">
                                 {BOOT_SEQUENCE[bootLogIndex]}
                             </span>
                             <span className="text-[9px] font-bold text-white font-mono">
                                 {Math.round(bootProgress)}%
                             </span>
                         </div>
                         
                         <div className="h-[2px] w-full bg-zinc-900 overflow-hidden relative">
                             <motion.div 
                                 className="absolute inset-y-0 left-0 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                                 style={{ width: `${bootProgress}%` }}
                             />
                         </div>
                     </div>

                 </div>

                 {/* Bottom Disclaimer */}
                 <div className="absolute bottom-8 text-[7px] text-zinc-700 font-mono uppercase tracking-[0.2em]">
                     Secure Connection • Encrypted SHA-256
                 </div>

             </MotionDiv>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto relative z-10 flex flex-col min-h-screen bg-[#09090b] shadow-2xl">
        
        <AnimatePresence>
            {latestToast && view !== 'LOGIN' && !isStartupLoading && (
                <MotionDiv 
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    onClick={() => { setView('NOTIFICATIONS'); setLatestToast(null); }}
                    className="fixed top-4 left-0 right-0 z-[100] px-4 flex justify-center pointer-events-none"
                >
                    <div className="pointer-events-auto bg-[#18181b]/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[90%] w-full cursor-pointer ring-1 ring-white/5">
                        <div className={`p-2 rounded-xl shrink-0 ${
                            latestToast.sender === 'Administrator' 
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                                : latestToast.type === 'warning' 
                                    ? 'bg-orange-500/10 text-orange-500' 
                                    : 'bg-blue-500/10 text-blue-500'
                        }`}>
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            {(() => {
                                const title = latestToast.titleKey && (t as any)[latestToast.titleKey] ? (t as any)[latestToast.titleKey] : latestToast.title;
                                const message = latestToast.messageKey && (t as any)[latestToast.messageKey] ? (t as any)[latestToast.messageKey] : latestToast.message;
                                return (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs font-bold text-white truncate">{title}</h4>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 truncate">{message}</p>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </MotionDiv>
            )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
            {view === 'LOGIN' && !isStartupLoading && (
                <Login key="login" onLoginSuccess={handleLoginSuccess} language={language} onLanguageChange={changeLanguage} onGetCode={() => setView('GET_CODE')} />
            )}

            {view !== 'LOGIN' && !isStartupLoading && (
                <MotionDiv className="flex-1 flex flex-col min-h-screen">
                     {renderContent()}
                </MotionDiv>
            )}

        </AnimatePresence>

        {showBottomNav && !isStartupLoading && (
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 max-w-md mx-auto">
                <div className="bg-[#121214]/80 backdrop-blur-lg border border-white/10 rounded-2xl p-1 grid grid-cols-4 items-center shadow-2xl">
                    <button 
                        onClick={() => { playSound('click'); selectGame('SELECTION'); }}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${view === 'SELECTION' ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Home className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{t.home}</span>
                    </button>
                    <button 
                        onClick={() => { playSound('click'); selectGame('NOTIFICATIONS'); }}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${view === 'NOTIFICATIONS' ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'} relative`}
                    >
                        <div className="relative">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#09090b] flex items-center justify-center">
                                    <span className="text-[8px] font-bold text-white">{unreadCount > 9 ? '!' : unreadCount}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider">{t.alerts}</span>
                    </button>
                    <button 
                        onClick={() => { playSound('click'); selectGame('CHAT_SUPPORT'); }}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${view === 'CHAT_SUPPORT' ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                         <div className="relative">
                            <MessageSquare className="w-5 h-5" />
                            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider">{t.chatSupport}</span>
                    </button>
                    <button 
                        onClick={() => { playSound('click'); selectGame('PROFILE'); }}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${view === 'PROFILE' ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <User className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{t.profile}</span>
                    </button>
                </div>
            </div>
        )}

        {/* Server Hash Modal */}
        <AnimatePresence>
            {isHashModalOpen && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    onClick={() => setIsHashModalOpen(false)}
                >
                    <MotionDiv
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="bg-[#09090b] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-blue-500" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Server Hash Ledger</h3>
                            </div>
                            <button onClick={() => setIsHashModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>
                        
                        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl mb-4">
                                <p className="text-[10px] text-blue-300 leading-relaxed">
                                    All game outcomes are cryptographically generated. The active hash is used for current predictions.
                                </p>
                            </div>

                            {MOCK_HASHES.map((item) => (
                                <div key={item.id} className={`p-3 rounded-xl border ${item.active ? 'bg-[#121214] border-green-500/30' : 'bg-zinc-900/50 border-white/5'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {item.active ? (
                                                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                    <span className="text-[9px] font-bold text-green-400 uppercase">Active Seed</span>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-bold text-zinc-600 uppercase">Archived</span>
                                            )}
                                        </div>
                                        <span className="text-[9px] text-zinc-500 font-mono">
                                            {new Date(item.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                                        <Hash className="w-3 h-3 text-zinc-600 shrink-0" />
                                        <code className="text-[10px] text-zinc-400 font-mono truncate flex-1">
                                            {item.hash}
                                        </code>
                                        <button 
                                            onClick={() => copyHash(item.hash, item.id)}
                                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                        >
                                            {copiedHashId === item.id ? (
                                                <Check className="w-3 h-3 text-green-500" />
                                            ) : (
                                                <Copy className="w-3 h-3 text-zinc-500 hover:text-white" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>

        {/* Game Loading Splash Screen (Static Background) */}
        <AnimatePresence>
            {isGameLoading && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden"
                >
                     {/* Static Background Grid */}
                     <div className="absolute inset-0 bg-[#000000] z-0" />
                     
                     {/* Top Branding */}
                     <div className="absolute top-16 left-0 right-0 text-center z-10">
                        <motion.h2 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 tracking-[0.5em] font-mono"
                        >
                            EL HETAN V1
                        </motion.h2>
                        <div className="h-0.5 w-16 bg-green-500/50 mx-auto mt-2 rounded-full" />
                     </div>

                     <div className="relative z-10 flex flex-col items-center gap-12 p-6 w-full max-w-sm">
                        
                        {/* Logo Container */}
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            {/* Static Rings for Performance */}
                            <div className="absolute inset-0 rounded-full border border-dashed border-zinc-700 opacity-30" />
                            <div className="absolute inset-2 rounded-full border border-dotted border-green-500/20" />
                            
                            {/* Glowing Core */}
                            <div className="relative w-24 h-24 rounded-2xl bg-[#0c0c0e] border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.1)] ring-1 ring-white/5 z-20">
                                 {(() => {
                                     switch(loadingGameKey) {
                                         case 'APPLE': return <LayoutGrid className="w-10 h-10 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />;
                                         case 'CRASH': return <Rocket className="w-10 h-10 text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />;
                                         case 'MINES': return <Bomb className="w-10 h-10 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />;
                                         case 'WILD_WEST': return <Crosshair className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />;
                                         case 'CHAT_SUPPORT': return <MessageSquare className="w-10 h-10 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />;
                                         case 'PROFILE': return <Fingerprint className="w-10 h-10 text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />;
                                         case 'NOTIFICATIONS': return <Bell className="w-10 h-10 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />;
                                         case 'USERS_ONLINE': return <Scan className="w-10 h-10 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />;
                                         case 'GET_CODE': return <Key className="w-10 h-10 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />;
                                         default: return <Binary className="w-10 h-10 text-white" />;
                                     }
                                 })()}
                            </div>
                        </div>

                        {/* Title & Status */}
                        <div className="text-center space-y-4 w-full">
                             <h3 className="text-3xl font-black text-white tracking-widest uppercase glitch-effect" data-text={loadingGameTitle}>
                                 {loadingGameTitle}
                             </h3>
                             
                             <div className="flex flex-col items-center gap-2 w-full">
                                 <div className="flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                     <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest">
                                        {getLoadingText(gameLoadProgress)}
                                     </span>
                                 </div>
                                 
                                 {/* Cyber Progress Bar */}
                                 <div className="w-64 h-2 bg-zinc-900/50 border border-white/10 rounded-full overflow-hidden relative">
                                     <div className="absolute inset-0 w-full h-full flex gap-0.5">
                                         {Array.from({length: 40}).map((_, i) => (
                                             <div key={i} className="w-full h-full bg-zinc-800/30 border-r border-black/50" />
                                         ))}
                                     </div>
                                     <motion.div 
                                        className="h-full bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${gameLoadProgress}%` }}
                                        transition={{ ease: "linear" }}
                                     />
                                 </div>
                                 <div className="w-64 flex justify-between text-[8px] font-mono text-zinc-600 uppercase">
                                     <span>System: Nominal</span>
                                     <span>{Math.round(gameLoadProgress)}%</span>
                                 </div>
                             </div>
                        </div>

                        {/* Bottom Decoration */}
                        <div className="absolute bottom-10 flex flex-col items-center gap-1 opacity-50">
                            <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Secure Environment</div>
                            <div className="flex gap-2">
                                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                            </div>
                        </div>

                     </div>
                </MotionDiv>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
};
