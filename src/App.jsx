import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import './App.css';

const firebaseConfig = {
  apiKey: 'AIzaSyBl3w5TZ7flwkeoJ6SGUZZoXFmeIKieZFE',
  authDomain: 'gamestox.firebaseapp.com',
  projectId: 'gamestox',
  storageBucket: 'gamestox.firebasestorage.app',
  messagingSenderId: '125113141786',
  appId: '1:125113141786:web:b52a271546231909545fa3',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const steamCover = (appId) =>
  `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;

const INITIAL_GAMES = [
  {
    id: 'fortnite',
    source: 'fortnite',
    ticker: 'FN',
    title: 'Fortnite (Battle Royale)',
    genre: 'Battle Royale',
    badge: '🪂 Epic Mega-Hit',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/a/ae/Fortnite_Save_The_World.jpg',
    gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)',
  },
  {
    id: 'cs2',
    source: 'steam',
    appId: 730,
    ticker: 'CS2',
    title: 'Counter-Strike 2',
    genre: 'Tactical Shooter',
    badge: '🔥 Steam #1',
    coverUrl: steamCover(730),
    gradient: 'linear-gradient(135deg, #d97706, #78350f)',
  },
  {
    id: 'pubg',
    source: 'steam',
    appId: 578080,
    ticker: 'PUBG',
    title: 'PUBG: BATTLEGROUNDS',
    genre: 'Battle Royale',
    badge: '🪖 Battle Royale',
    coverUrl: steamCover(578080),
    gradient: 'linear-gradient(135deg, #ca8a04, #422006)',
  },
  {
    id: 'dota2',
    source: 'steam',
    appId: 570,
    ticker: 'DOTA',
    title: 'Dota 2',
    genre: 'MOBA',
    badge: '🏆 Esports Giant',
    coverUrl: steamCover(570),
    gradient: 'linear-gradient(135deg, #b91c1c, #31102f)',
  },
  {
    id: 'rivals',
    source: 'steam',
    appId: 2767030,
    ticker: 'MRVL',
    title: 'Marvel Rivals',
    genre: 'Hero Shooter',
    badge: '🦸 Hero Shooter',
    coverUrl: steamCover(2767030),
    gradient: 'linear-gradient(135deg, #2563eb, #1e1b4b)',
  },
  {
    id: 'minecraft',
    source: 'minecraft',
    serverIp: 'mc.hypixel.net',
    ticker: 'MC',
    title: 'Minecraft (Hypixel Live)',
    genre: 'Sandbox / Multiplayer',
    badge: '⛏️ Live Server Pulse',
    coverUrl:
      'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Buzzy-Bees_1280x768.jpg',
    gradient: 'linear-gradient(135deg, #16a34a, #14532d)',
  },
  {
    id: 'apex',
    source: 'steam',
    appId: 1172470,
    ticker: 'APEX',
    title: 'Apex Legends',
    genre: 'Battle Royale',
    badge: '🎯 Arena Shooter',
    coverUrl: steamCover(1172470),
    gradient: 'linear-gradient(135deg, #e11d48, #4c0519)',
  },
  {
    id: 'rust',
    source: 'steam',
    appId: 252490,
    ticker: 'RUST',
    title: 'Rust',
    genre: 'Survival',
    badge: '🪓 High Volatility',
    coverUrl: steamCover(252490),
    gradient: 'linear-gradient(135deg, #ea580c, #431407)',
  },
  {
    id: 'hd2',
    source: 'steam',
    appId: 553850,
    ticker: 'HD2',
    title: 'Helldivers 2',
    genre: 'Co-op Shooter',
    badge: '🚀 Co-op Action',
    coverUrl: steamCover(553850),
    gradient: 'linear-gradient(135deg, #eab308, #1e293b)',
  },
  {
    id: 'elden',
    source: 'steam',
    appId: 1245620,
    ticker: 'ELDN',
    title: 'Elden Ring',
    genre: 'Action RPG',
    badge: '⚔️ Action RPG',
    coverUrl: steamCover(1245620),
    gradient: 'linear-gradient(135deg, #059669, #064e3b)',
  },
  {
    id: 'balatro',
    source: 'steam',
    appId: 2379780,
    ticker: 'BLTR',
    title: 'Balatro',
    genre: 'Indie Roguelike',
    badge: '🃏 Indie Hit',
    coverUrl: steamCover(2379780),
    gradient: 'linear-gradient(135deg, #dc2626, #312e81)',
  },
  {
    id: 'gtav',
    source: 'steam',
    appId: 271590,
    ticker: 'GTAV',
    title: 'Grand Theft Auto V',
    genre: 'Open World',
    badge: '🚔 Crime Classic',
    coverUrl: steamCover(271590),
    gradient: 'linear-gradient(135deg, #15803d, #14532d)',
  },
  {
    id: 'cod',
    source: 'steam',
    appId: 1938090,
    ticker: 'COD',
    title: 'Call of Duty',
    genre: 'FPS / Warzone',
    badge: '🎖️ AAA Shooter',
    coverUrl: steamCover(1938090),
    gradient: 'linear-gradient(135deg, #4d7c0f, #1a2e05)',
  },
  {
    id: 'tf2',
    source: 'steam',
    appId: 440,
    ticker: 'TF2',
    title: 'Team Fortress 2',
    genre: 'Class Shooter',
    badge: '🎩 Valve Legend',
    coverUrl: steamCover(440),
    gradient: 'linear-gradient(135deg, #b45309, #451a03)',
  },
  {
    id: 'dbd',
    source: 'steam',
    appId: 381210,
    ticker: 'DBD',
    title: 'Dead by Daylight',
    genre: 'Asymmetric Horror',
    badge: '🪝 Horror Hit',
    coverUrl: steamCover(381210),
    gradient: 'linear-gradient(135deg, #991b1b, #1f2937)',
  },
  {
    id: 'warframe',
    source: 'steam',
    appId: 230410,
    ticker: 'WRFM',
    title: 'Warframe',
    genre: 'Sci-Fi Looter',
    badge: '🥷 Space Ninja',
    coverUrl: steamCover(230410),
    gradient: 'linear-gradient(135deg, #0284c7, #0f172a)',
  },
  {
    id: 'bg3',
    source: 'steam',
    appId: 1086940,
    ticker: 'BG3',
    title: "Baldur's Gate 3",
    genre: 'CRPG',
    badge: '🐉 GOTY Winner',
    coverUrl: steamCover(1086940),
    gradient: 'linear-gradient(135deg, #7e22ce, #1e1b4b)',
  },
  {
    id: 'bloxfruits',
    source: 'roblox',
    universeId: 994732206,
    ticker: 'BLOX',
    title: 'Blox Fruits (Roblox)',
    genre: 'Anime Action RPG',
    badge: '🏴‍☠️ Roblox Mega-Hit',
    coverUrl: '',
    gradient: 'linear-gradient(135deg, #2563eb, #0f172a)',
  },
  {
    id: 'brookhaven',
    source: 'roblox',
    universeId: 1686885941,
    ticker: 'BRKH',
    title: 'Brookhaven RP (Roblox)',
    genre: 'Social Roleplay',
    badge: '🏡 Roblox #1 RP',
    coverUrl: '',
    gradient: 'linear-gradient(135deg, #0d9488, #134e4a)',
  },
];

const calcPrice = (players) => Number(Math.max(0.5, players / 1000).toFixed(2));

function InteractiveRealChart({ realHistory, avgBuyPrice, livePrice }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [chartMode, setChartMode] = useState('price'); // 'price' | 'compare' | 'live'

  if (!realHistory || realHistory.length === 0) {
    return (
      <div
        style={{
          height: '230px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8b949e',
        }}
      >
        Waiting for 24/7 cloud collector to record first tick...
      </div>
    );
  }

  // Show the latest 24 hours (up to 288 ticks) on the chart
  const recent24h = realHistory.slice(-288);
  const series =
    recent24h.length === 1
      ? [
          { ...recent24h[0], timeLabel: `${recent24h[0].timeLabel} (Start)` },
          { ...recent24h[0], timeLabel: `${recent24h[0].timeLabel} (Latest)` },
        ]
      : recent24h;

  const width = 700;
  const height = 220;
  const padLeft = 14;
  const padRight = 62;
  const padTop = 22;
  const padBottom = 26;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const primaryValues = series.map((d, idx) => {
    if (chartMode === 'price') {
      if (idx === series.length - 1 && livePrice > 0) return livePrice;
      return calcPrice(d.fairPlayers ?? d.rollingAvg ?? d.players);
    }
    return d.players;
  });

  const yesterdayValues =
    chartMode === 'compare'
      ? series.map((d) => (typeof d.yesterdayPlayers === 'number' ? d.yesterdayPlayers : null))
      : [];

  const validYesterday = yesterdayValues.filter((v) => v !== null);
  const allValsForScale =
    chartMode === 'compare' && validYesterday.length > 0
      ? [...primaryValues, ...validYesterday]
      : primaryValues;

  const avgPrimary =
    primaryValues.reduce((a, b) => a + b, 0) / (primaryValues.length || 1);

  const rawMin = Math.min(...allValsForScale, avgPrimary);
  const rawMax = Math.max(...allValsForScale, avgPrimary);
  const spread = rawMax - rawMin || Math.max(0.5, rawMax * 0.005);
  const minVal = rawMin - spread * 0.22;
  const maxVal = rawMax + spread * 0.22;
  const range = maxVal - minVal || 1;

  const getX = (idx) => padLeft + (idx / (series.length - 1)) * chartW;
  const getY = (val) => padTop + chartH - ((val - minVal) / range) * chartH;

  const coords = series.map((d, i) => ({
    x: getX(i),
    y: getY(primaryValues[i]),
    val: primaryValues[i],
    yestVal: yesterdayValues[i] ?? null,
    livePlayers: d.players,
    price:
      i === series.length - 1 && livePrice > 0
        ? livePrice
        : calcPrice(d.fairPlayers ?? d.rollingAvg ?? d.players),
    timeLabel: d.timeLabel,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padTop + chartH} L ${
    coords[0].x
  } ${padTop + chartH} Z`;

  // Build dotted line path for Yesterday's player count in 'compare' mode
  let yesterdayPath = '';
  if (chartMode === 'compare') {
    let penDown = false;
    coords.forEach((c) => {
      if (c.yestVal !== null) {
        const yY = getY(c.yestVal);
        yesterdayPath += `${penDown ? 'L' : 'M'} ${c.x} ${yY} `;
        penDown = true;
      } else {
        penDown = false;
      }
    });
  }

  const activeIdx =
    selectedIndex !== null && selectedIndex < coords.length ? selectedIndex : coords.length - 1;
  const activePt = coords[activeIdx];

  const isPositive =
    chartMode === 'compare' && activePt.yestVal
      ? activePt.val >= activePt.yestVal
      : activePt.val >= coords[0].val;

  const strokeColor = isPositive ? '#3fb950' : '#f85149';

  const buyY =
    chartMode === 'price' && avgBuyPrice && avgBuyPrice >= minVal && avgBuyPrice <= maxVal
      ? getY(avgBuyPrice)
      : null;

  const formatAxis = (v) =>
    chartMode === 'price' ? `$${v.toFixed(2)}` : `${(v / 1000).toFixed(0)}k`;

  return (
    <div>
      {/* 3-Tab Graph Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'price', label: '📈 Stock Price' },
            { id: 'compare', label: '⚔️ Today vs. Yesterday' },
            { id: 'live', label: '👥 Live Players' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setChartMode(tab.id);
                setSelectedIndex(null);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: chartMode === tab.id ? '1px solid #58a6ff' : '1px solid #30363d',
                background: chartMode === tab.id ? '#1f2937' : '#0d1117',
                color: chartMode === tab.id ? '#58a6ff' : '#8b949e',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>
          {selectedIndex !== null ? `📌 ${activePt.timeLabel}` : `🟢 Latest (${activePt.timeLabel})`}
        </div>
      </div>

      {/* Dynamic Header Readout */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {chartMode === 'price' && (
          <>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f0f6fc' }}>
              ${activePt.price.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.9rem', color: '#8b949e' }}>
              👥 {activePt.livePlayers.toLocaleString()} live players
            </span>
          </>
        )}

        {chartMode === 'compare' && (
          <>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f0f6fc' }}>
              Today: {activePt.livePlayers.toLocaleString()}
            </span>
            {activePt.yestVal ? (
              <span style={{ fontSize: '0.95rem', color: isPositive ? '#3fb950' : '#f85149', fontWeight: 700 }}>
                vs. Yesterday: {activePt.yestVal.toLocaleString()} (
                {(((activePt.livePlayers - activePt.yestVal) / activePt.yestVal) * 100).toFixed(1)}%)
              </span>
            ) : (
              <span style={{ fontSize: '0.85rem', color: '#d29922' }}>
                Collecting 24h baseline for yesterday's dotted line...
              </span>
            )}
          </>
        )}

        {chartMode === 'live' && (
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f0f6fc' }}>
            👥 {activePt.livePlayers.toLocaleString()} live concurrent players
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '220px', cursor: 'crosshair', userSelect: 'none' }}
        onMouseLeave={() => setSelectedIndex(null)}
      >
        <defs>
          <linearGradient id="realAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((ratio, idx) => {
          const gy = padTop + chartH * ratio;
          const valAtLine = maxVal - range * ratio;
          return (
            <g key={idx}>
              <line x1={padLeft} y1={gy} x2={width - padRight} y2={gy} stroke="#21262d" strokeWidth="1" />
              <text x={width - padRight + 6} y={gy + 4} fill="#6e7681" fontSize="10">
                {formatAxis(valAtLine)}
              </text>
            </g>
          );
        })}

        {buyY !== null && (
          <>
            <line
              x1={padLeft}
              y1={buyY}
              x2={width - padRight}
              y2={buyY}
              stroke="#58a6ff"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
            <text x={padLeft + 4} y={buyY - 5} fill="#58a6ff" fontSize="10" fontWeight="700">
              Your Avg Buy (${avgBuyPrice.toFixed(2)})
            </text>
          </>
        )}

        {/* Yesterday dotted overlay in Compare mode */}
        {chartMode === 'compare' && yesterdayPath && (
          <path
            d={yesterdayPath}
            fill="none"
            stroke="#8b949e"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        <path d={areaPath} fill="url(#realAreaGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx={activePt.x}
          cy={activePt.y}
          r="5.5"
          fill={strokeColor}
          stroke="#0d1117"
          strokeWidth="2"
        />

        <line
          x1={activePt.x}
          y1={padTop}
          x2={activePt.x}
          y2={padTop + chartH}
          stroke="#8b949e"
          strokeWidth="1"
          strokeDasharray="3,3"
        />

        {coords.map((c, idx) => {
          const colWidth = chartW / coords.length;
          return (
            <rect
              key={idx}
              x={c.x - colWidth / 2}
              y={padTop}
              width={colWidth}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => setSelectedIndex(idx)}
              onClick={() => setSelectedIndex(idx)}
            />
          );
        })}
      </svg>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: '#8b949e',
          marginTop: '4px',
        }}
      >
        <span>{series[0]?.timeLabel}</span>
        <span>
          {chartMode === 'compare'
            ? 'Solid = Today • Dotted = Same Time Yesterday'
            : 'Hover or click any point to inspect'}
        </span>
        <span>{series[series.length - 1]?.timeLabel}</span>
      </div>
    </div>
  );
}

function AuthModal({ onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '420px', padding: '28px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2>{isSignUp ? 'Create GameStox Account' : 'Sign In to Trade'}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '18px' }}>
          New accounts start with <strong>$10,000.00</strong> in cloud-saved trading cash.
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #30363d',
            background: '#f0f6fc',
            color: '#0d1117',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          Continue with Google
        </button>

        <div
          style={{
            textAlign: 'center',
            color: '#8b949e',
            fontSize: '0.8rem',
            marginBottom: '16px',
          }}
        >
          OR WITH EMAIL
        </div>

        <form onSubmit={handleEmailSubmit}>
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="amount-input"
            style={{ marginBottom: '10px' }}
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="amount-input"
            style={{ marginBottom: '14px' }}
          />

          {error && (
            <div style={{ color: '#f85149', fontSize: '0.85rem', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="action-btn buy-btn"
            style={{ width: '100%' }}
          >
            {submitting ? 'Please wait...' : isSignUp ? 'Create Account ($10k)' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.88rem', color: '#8b949e' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#58a6ff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [historyMap, setHistoryMap] = useState({});
  const [demandMap, setDemandMap] = useState({});
  const [cash, setCash] = useState(10000);
  const [portfolio, setPortfolio] = useState({});
  const [activeTab, setActiveTab] = useState('market');
  const [filter, setFilter] = useState('all');
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [tradeAmount, setTradeAmount] = useState('500');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setCash(10000);
      setPortfolio({});
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    let unsubUser = () => {};

    const initAndSubscribeUser = async () => {
      try {
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          await setDoc(userDocRef, {
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Trader',
            cash: 10000,
            portfolio: {},
            createdAt: Date.now(),
          });
        }

        unsubUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCash(typeof data.cash === 'number' ? data.cash : 10000);
            setPortfolio(data.portfolio || {});
          }
        });
      } catch (err) {
        console.error('Failed loading user portfolio:', err);
      }
    };

    initAndSubscribeUser();
    return () => unsubUser();
  }, [user, authReady]);

  // Listen to market history
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'market'), (snapshot) => {
      const nextMap = {};
      let latestTimestamp = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (Array.isArray(data.history)) {
          nextMap[docSnap.id] = data.history;
        }
        if (data.updatedAt && data.updatedAt > latestTimestamp) {
          latestTimestamp = data.updatedAt;
        }
      });

      setHistoryMap(nextMap);
      if (latestTimestamp > 0) {
        setLastUpdated(new Date(latestTimestamp).toLocaleTimeString());
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to hidden demand multipliers
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'demand'), (snapshot) => {
      const nextDemand = {};
      snapshot.forEach((docSnap) => {
        const val = docSnap.data()?.multiplier;
        if (typeof val === 'number') nextDemand[docSnap.id] = val;
      });
      setDemandMap(nextDemand);
    });
    return () => unsubscribe();
  }, []);

const enrichedGames = INITIAL_GAMES.map((g) => {
    const playersHistory = historyMap[g.id] || [];
    const len = playersHistory.length;
    const latestEntry = len > 0 ? playersHistory[len - 1] : null;
    const recent24h = playersHistory.slice(-288);
    const openEntry = recent24h.length > 0 ? recent24h[0] : latestEntry;

    const currentPlayers = latestEntry ? latestEntry.players : 0;
    const yesterdayPlayers = latestEntry?.yesterdayPlayers ?? null;
    const basePlayers = latestEntry
      ? latestEntry.fairPlayers ?? latestEntry.rollingAvg ?? latestEntry.players
      : 0;
    const openBasePlayers = openEntry
      ? openEntry.fairPlayers ?? openEntry.rollingAvg ?? openEntry.players
      : basePlayers;

    const price = basePlayers > 0 ? calcPrice(basePlayers) : 0;
    const openPrice = openBasePlayers > 0 ? calcPrice(openBasePlayers) : price;

    // Red/Green % = Now vs. same time yesterday (falls back to open price if <24h of data)
    let changePct = 0;
    if (yesterdayPlayers && yesterdayPlayers > 0 && currentPlayers > 0) {
      changePct = Number(
        (((currentPlayers - yesterdayPlayers) / yesterdayPlayers) * 100).toFixed(2)
      );
    } else if (openPrice > 0) {
      changePct = Number((((price - openPrice) / openPrice) * 100).toFixed(2));
    }

    return { ...g, playersHistory, currentPlayers, yesterdayPlayers, price, changePct };
  });

  const holdingsList = Object.entries(portfolio)
    .filter(([, data]) => data.shares > 0.0001)
    .map(([gameId, data]) => {
      const game = enrichedGames.find((g) => g.id === gameId);
      const currentPrice = game?.price || 0;
      const currentValue = data.shares * currentPrice;
      const profit = currentValue - data.totalCost;
      const profitPct = data.totalCost > 0 ? (profit / data.totalCost) * 100 : 0;
      const avgBuyPrice = data.totalCost / data.shares;
      return {
        ...game,
        shares: data.shares,
        totalCost: data.totalCost,
        avgBuyPrice,
        currentValue,
        profit,
        profitPct,
      };
    });

  const investedValue = holdingsList.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCostBasis = holdingsList.reduce((sum, h) => sum + h.totalCost, 0);
  const totalNetWorth = cash + investedValue;
  const totalProfit = investedValue - totalCostBasis;

  const selectedGame = enrichedGames.find((g) => g.id === selectedGameId);
  const selectedHolding = selectedGameId ? portfolio[selectedGameId] : null;
  const selectedAvgBuy =
    selectedHolding && selectedHolding.shares > 0
      ? selectedHolding.totalCost / selectedHolding.shares
      : null;

  const saveUserState = async (nextCash, nextPortfolio) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        cash: nextCash,
        portfolio: nextPortfolio,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  };

  // Quietly nudge hidden demand multiplier on trade (±0.4% per $1,000, clamped 0.75x - 1.35x)
  const nudgeDemand = async (gameId, dollarDelta) => {
    try {
      const current = demandMap[gameId] ?? 1;
      const impact = (dollarDelta / 1000) * 0.004;
      const nextMult = Number(Math.max(0.75, Math.min(1.35, current + impact)).toFixed(4));
      await setDoc(
        doc(db, 'demand', gameId),
        { multiplier: nextMult, updatedAt: Date.now() },
        { merge: true }
      );
    } catch {
      // Ignore silent demand update errors
    }
  };

  const handleBuy = async (game, dollarAmt) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const amount = Number(dollarAmt);
    if (!amount || amount <= 0 || amount > cash || game.price <= 0) return;
    const sharesBought = amount / game.price;

    const nextCash = Number((cash - amount).toFixed(2));
    const existing = portfolio[game.id] || { shares: 0, totalCost: 0 };
    const nextPortfolio = {
      ...portfolio,
      [game.id]: {
        shares: existing.shares + sharesBought,
        totalCost: existing.totalCost + amount,
      },
    };

    setCash(nextCash);
    setPortfolio(nextPortfolio);
    await Promise.all([saveUserState(nextCash, nextPortfolio), nudgeDemand(game.id, amount)]);
  };

  const handleSell = async (game, dollarAmt) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const existing = portfolio[game.id];
    if (!existing || existing.shares <= 0 || game.price <= 0) return;

    const maxDollarValue = existing.shares * game.price;
    const sellDollars = Math.min(Number(dollarAmt), maxDollarValue);
    if (!sellDollars || sellDollars <= 0) return;

    const sharesSold = sellDollars / game.price;
    const fractionSold = sharesSold / existing.shares;
    const costRemoved = existing.totalCost * fractionSold;

    const nextCash = Number((cash + sellDollars).toFixed(2));
    const remainingShares = existing.shares - sharesSold;
    const nextPortfolio = { ...portfolio };

    if (remainingShares < 0.0001) {
      delete nextPortfolio[game.id];
    } else {
      nextPortfolio[game.id] = {
        shares: remainingShares,
        totalCost: existing.totalCost - costRemoved,
      };
    }

    setCash(nextCash);
    setPortfolio(nextPortfolio);
    await Promise.all([saveUserState(nextCash, nextPortfolio), nudgeDemand(game.id, -sellDollars)]);
  };

  const resetAccount = async () => {
    if (!user) return;
    if (!window.confirm('Reset your cash back to $10,000 and clear all shares?')) return;
    setCash(10000);
    setPortfolio({});
    await saveUserState(10000, {});
  };

  const filteredGames = enrichedGames.filter((g) => {
    if (filter === 'gainers') return g.changePct > 0;
    if (filter === 'popular') return g.currentPlayers >= 100000;
    return true;
  });

  return (
    <div>
      <div className="ticker-bar">
        <span>🟢 24/7 CLOUD MARKET {lastUpdated ? `(Last Sync: ${lastUpdated})` : ''}:</span>
        {enrichedGames.map((g) => (
          <span key={g.id}>
            <strong>{g.ticker}</strong>{' '}
            {g.price > 0 ? `$${g.price.toFixed(2)}` : 'Waiting...'}{' '}
            {g.price > 0 && (
              <span style={{ color: g.changePct >= 0 ? '#3fb950' : '#f85149' }}>
                ({g.changePct >= 0 ? '+' : ''}
                {g.changePct}%)
              </span>
            )}
          </span>
        ))}
      </div>

      <nav className="navbar">
        <div className="brand">🎮 GameStox</div>

        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            Market
          </button>
          <button
            className={`tab-btn ${activeTab === 'shares' ? 'active' : ''}`}
            onClick={() => setActiveTab('shares')}
          >
            My Shares ({holdingsList.length})
          </button>
        </div>

        <div className="wallet-stats">
          {user ? (
            <>
              <div className="stat-pill">
                <div className="stat-label">Available Cash</div>
                <div className="stat-value">
                  $
                  {cash.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="stat-pill">
                <div className="stat-label">Net Worth</div>
                <div className="stat-value" style={{ color: '#58a6ff' }}>
                  $
                  {totalNetWorth.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="stat-pill" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div>
                  <div className="stat-label">Trader</div>
                  <div className="stat-value" style={{ fontSize: '0.88rem', color: '#f0f6fc' }}>
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                </div>
                <button
                  className="small-btn"
                  style={{ background: '#21262d', color: '#c9d1d9', padding: '6px 10px' }}
                  onClick={() => signOut(auth)}
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <button
              className="sim-btn"
              style={{ padding: '10px 18px', fontWeight: 700 }}
              onClick={() => setShowAuthModal(true)}
            >
              Sign In / Start with $10k
            </button>
          )}
        </div>
      </nav>

      <div className="container">
        {activeTab === 'market' ? (
          <>
            <div className="controls-row">
              <h2>24/7 Live Game Stocks {isLoading ? '(Syncing...)' : ''}</h2>
              <div className="filter-pills">
                <button
                  className={`pill ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Games ({enrichedGames.length})
                </button>
                <button
                  className={`pill ${filter === 'gainers' ? 'active' : ''}`}
                  onClick={() => setFilter('gainers')}
                >
                  🔥 Rising (24H)
                </button>
                <button
                  className={`pill ${filter === 'popular' ? 'active' : ''}`}
                  onClick={() => setFilter('popular')}
                >
                  👑 100K+ Concurrent
                </button>
              </div>
            </div>

            <div className="game-grid">
              {filteredGames.map((game) => {
                const owned = portfolio[game.id];
                return (
                  <div
                    key={game.id}
                    className="game-card"
                    onClick={() => {
                      setSelectedGameId(game.id);
                      setTradeAmount('500');
                    }}
                  >
                    <div
                      className="card-banner"
                      style={{
                        backgroundImage: game.coverUrl
                          ? `url(${game.coverUrl}), ${game.gradient}`
                          : game.gradient,
                      }}
                    >
                      <span className="badge">{game.badge}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f0f6fc' }}>
                        {game.genre}
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="card-title-row">
                        <div>
                          <div className="game-title">{game.title}</div>
                          <div className="ticker-tag">
                            {game.ticker} • LIVE MARKET
                          </div>
                        </div>
                        <div className="price-block">
                          <div className="share-price">
                            {game.price > 0 ? `$${game.price.toFixed(2)}` : '...'}
                          </div>
                          {game.price > 0 && (
                            <span className={`pct-badge ${game.changePct >= 0 ? 'up' : 'down'}`}>
                              {game.changePct >= 0 ? '▲' : '▼'} {Math.abs(game.changePct)}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="card-footer">
                        <span>
                          👥 {game.currentPlayers > 0 ? game.currentPlayers.toLocaleString() : '---'} live
                        </span>
                        {owned ? (
                          <span style={{ color: '#58a6ff', fontWeight: 700 }}>
                            Owned: {owned.shares.toFixed(2)} sh
                          </span>
                        ) : (
                          <span>Click to trade →</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : !user ? (
          <div className="summary-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <h2 style={{ marginBottom: '10px' }}>Sign In to View Your Portfolio</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Create an account to claim $10,000 in virtual trading cash and track your shares across devices.
            </p>
            <button className="sim-btn" onClick={() => setShowAuthModal(true)}>
              Sign In / Create Account
            </button>
          </div>
        ) : (
          <div>
            <div className="controls-row">
              <h2>My Shares & Live Profit</h2>
              <button
                className="small-btn"
                style={{ background: 'var(--bg-card)', color: '#8b949e' }}
                onClick={resetAccount}
              >
                Reset $10k Wallet
              </button>
            </div>

            <div className="portfolio-summary">
              <div className="summary-card">
                <h3>Total Net Worth</h3>
                <div className="big-num">
                  $
                  {totalNetWorth.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="summary-card">
                <h3>Invested Value</h3>
                <div className="big-num">
                  $
                  {investedValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="summary-card">
                <h3>Open Profit / Loss</h3>
                <div
                  className="big-num"
                  style={{ color: totalProfit >= 0 ? '#3fb950' : '#f85149' }}
                >
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
                </div>
              </div>
            </div>

            {holdingsList.length === 0 ? (
              <div className="summary-card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
                  You don't own any game shares yet.
                </p>
                <button className="sim-btn" onClick={() => setActiveTab('market')}>
                  Browse Live Games
                </button>
              </div>
            ) : (
              holdingsList.map((h) => (
                <div key={h.id} className="holding-row">
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                      {h.title} <span className="ticker-tag">({h.ticker})</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {h.shares.toFixed(3)} shares • Avg Buy: ${h.avgBuyPrice.toFixed(2)} • Price: $
                      {h.price.toFixed(2)} ({h.currentPlayers.toLocaleString()} live players)
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                      ${h.currentValue.toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: h.profit >= 0 ? '#3fb950' : '#f85149',
                      }}
                    >
                      {h.profit >= 0 ? '+' : ''}${h.profit.toFixed(2)} ({h.profitPct >= 0 ? '+' : ''}
                      {h.profitPct.toFixed(2)}%)
                    </div>
                  </div>

                  <div className="holding-actions">
                    <button
                      className="small-btn"
                      style={{ background: 'var(--bg-hover)', color: 'white' }}
                      onClick={() => setSelectedGameId(h.id)}
                    >
                      Graph / Trade
                    </button>
                    <button
                      className="small-btn cashout-btn"
                      onClick={() => handleSell(h, h.currentValue)}
                    >
                      Sell All (${h.currentValue.toFixed(2)})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedGame && (
        <div className="modal-backdrop" onClick={() => setSelectedGameId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                height: '130px',
                borderRadius: '10px',
                backgroundImage: selectedGame.coverUrl
                  ? `linear-gradient(to top, rgba(22,27,34,1) 5%, rgba(22,27,34,0.25) 100%), url(${selectedGame.coverUrl})`
                  : selectedGame.gradient,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '14px',
              }}
            >
              <div>
                <h2>
                  {selectedGame.title} ({selectedGame.ticker})
                </h2>
                <span style={{ color: '#c9d1d9', fontSize: '0.9rem' }}>
                  👥 {selectedGame.currentPlayers.toLocaleString()} Live Players • Share Price:{' '}
                  <strong style={{ color: 'white' }}>${selectedGame.price.toFixed(2)}</strong>
                </span>
              </div>
              <button className="close-btn" onClick={() => setSelectedGameId(null)}>
                ✕
              </button>
            </div>

            <div className="chart-box">
              <InteractiveRealChart
                realHistory={selectedGame.playersHistory}
                avgBuyPrice={selectedAvgBuy}
                livePrice={selectedGame.price}
              />
            </div>

            {!user ? (
              <div
                style={{
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '10px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: '#c9d1d9', marginBottom: '12px' }}>
                  Sign in to buy or sell <strong>{selectedGame.ticker}</strong> with your $10,000 portfolio.
                </p>
                <button
                  className="action-btn buy-btn"
                  style={{ maxWidth: '260px', margin: '0 auto' }}
                  onClick={() => {
                    setSelectedGameId(null);
                    setShowAuthModal(true);
                  }}
                >
                  Sign In to Trade
                </button>
              </div>
            ) : (
              <div className="trade-panel">
                <div className="trade-box">
                  <h4 style={{ marginBottom: '8px' }}>Trade Amount ($)</h4>
                  <input
                    type="number"
                    className="amount-input"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    min="1"
                  />
                  <div className="quick-amounts">
                    <button className="amt-btn" onClick={() => setTradeAmount('100')}>
                      $100
                    </button>
                    <button className="amt-btn" onClick={() => setTradeAmount('500')}>
                      $500
                    </button>
                    <button
                      className="amt-btn"
                      onClick={() => setTradeAmount(Math.floor(cash * 0.25).toString())}
                    >
                      25% Cash
                    </button>
                    <button
                      className="amt-btn"
                      onClick={() => setTradeAmount(Math.floor(cash).toString())}
                    >
                      MAX
                    </button>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ≈{' '}
                    {selectedGame.price > 0
                      ? ((Number(tradeAmount) || 0) / selectedGame.price).toFixed(3)
                      : '0.000'}{' '}
                    shares of {selectedGame.ticker}
                  </div>
                </div>

                <div
                  className="trade-box"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h4 style={{ marginBottom: '6px' }}>Your Position</h4>
                    {portfolio[selectedGame.id] ? (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        You own <strong>{portfolio[selectedGame.id].shares.toFixed(3)} shares</strong>{' '}
                        worth{' '}
                        <strong style={{ color: 'white' }}>
                          ${(portfolio[selectedGame.id].shares * selectedGame.price).toFixed(2)}
                        </strong>
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        You don't own shares in this game yet.
                      </p>
                    )}
                  </div>

                  <div>
                    <button
                      className="action-btn buy-btn"
                      disabled={
                        !Number(tradeAmount) || Number(tradeAmount) > cash || selectedGame.price <= 0
                      }
                      onClick={() => handleBuy(selectedGame, tradeAmount)}
                    >
                      Buy ${Number(tradeAmount) || 0} of {selectedGame.ticker}
                    </button>

                    <button
                      className="action-btn sell-btn"
                      disabled={
                        !portfolio[selectedGame.id] || !Number(tradeAmount) || selectedGame.price <= 0
                      }
                      onClick={() => handleSell(selectedGame, tradeAmount)}
                    >
                      Sell ${Number(tradeAmount) || 0} of {selectedGame.ticker}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
