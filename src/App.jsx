import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import './App.css';

// 👇 PASTE YOUR FIREBASE WEB CONFIG HERE (from Firebase Project Settings -> Your Apps)
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

const steamCover = (appId) =>
  `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;

const INITIAL_GAMES = [
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
];

// Price formula: 1 share = 1,000 real concurrent players
const calcPrice = (players) => Number(Math.max(0.5, players / 1000).toFixed(2));

function InteractiveRealChart({ realHistory, avgBuyPrice }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

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

  const series =
    realHistory.length === 1
      ? [
          { ...realHistory[0], timeLabel: `${realHistory[0].timeLabel} (Start)` },
          { ...realHistory[0], timeLabel: `${realHistory[0].timeLabel} (Latest)` },
        ]
      : realHistory;

  const width = 700;
  const height = 220;
  const padLeft = 14;
  const padRight = 58;
  const padTop = 22;
  const padBottom = 26;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const values = series.map((d) => d.players);
  const avgPlayers = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const avgPrice = calcPrice(avgPlayers);

  const rawMin = Math.min(...values, avgPlayers);
  const rawMax = Math.max(...values, avgPlayers);
  const spread = rawMax - rawMin || Math.max(10, rawMax * 0.002);
  const minVal = rawMin - spread * 0.25;
  const maxVal = rawMax + spread * 0.25;
  const range = maxVal - minVal || 1;

  const getX = (idx) => padLeft + (idx / (series.length - 1)) * chartW;
  const getY = (val) => padTop + chartH - ((val - minVal) / range) * chartH;

  const coords = series.map((d, i) => ({
    x: getX(i),
    y: getY(d.players),
    players: d.players,
    price: calcPrice(d.players),
    timeLabel: d.timeLabel,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padTop + chartH} L ${
    coords[0].x
  } ${padTop + chartH} Z`;

  const avgY = getY(avgPlayers);

  let highIdx = 0;
  let lowIdx = 0;
  values.forEach((v, idx) => {
    if (v > values[highIdx]) highIdx = idx;
    if (v < values[lowIdx]) lowIdx = idx;
  });

  const activeIdx =
    selectedIndex !== null && selectedIndex < coords.length ? selectedIndex : coords.length - 1;
  const activePt = coords[activeIdx];

  const isAboveAvg = activePt.players >= avgPlayers;
  const vsAvgPct =
    avgPlayers > 0 ? (((activePt.players - avgPlayers) / avgPlayers) * 100).toFixed(2) : '0.00';
  const strokeColor = isAboveAvg ? '#3fb950' : '#f85149';

  const buyPlayersEquiv = avgBuyPrice ? avgBuyPrice * 1000 : null;
  const buyY =
    buyPlayersEquiv && buyPlayersEquiv >= minVal && buyPlayersEquiv <= maxVal
      ? getY(buyPlayersEquiv)
      : null;

  return (
    <div>
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
        <div>
          <div style={{ fontSize: '0.78rem', color: '#8b949e', marginBottom: '2px' }}>
            {selectedIndex !== null
              ? `📌 Recorded Time: ${activePt.timeLabel}`
              : `🟢 Latest Cloud Reading (${activePt.timeLabel})`}{' '}
            •{' '}
            <span style={{ color: isAboveAvg ? '#3fb950' : '#f85149', fontWeight: 700 }}>
              {isAboveAvg ? `▲ +${vsAvgPct}% ABOVE` : `▼ ${vsAvgPct}% BELOW`} 24H Avg
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f0f6fc' }}>
              ${activePt.price.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.95rem', color: '#c9d1d9', fontWeight: 600 }}>
              👥 {activePt.players.toLocaleString()} real players
            </span>
            <span style={{ fontSize: '0.82rem', color: '#8b949e' }}>
              (24H Avg: {avgPlayers.toLocaleString()} / ${avgPrice.toFixed(2)})
            </span>
          </div>
        </div>

        <div
          style={{
            background: '#161b22',
            border: '1px solid #30363d',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            color: '#58a6ff',
            fontWeight: 700,
          }}
        >
          24/7 Cloud Feed ({realHistory.length} ticks)
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '220px', cursor: 'crosshair', userSelect: 'none' }}
        onMouseLeave={() => setSelectedIndex(null)}
      >
        <defs>
          <linearGradient id="realAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((ratio, idx) => {
          const gy = padTop + chartH * ratio;
          const valAtLine = Math.round(maxVal - range * ratio);
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={gy}
                x2={width - padRight}
                y2={gy}
                stroke="#21262d"
                strokeWidth="1"
              />
              <text x={width - padRight + 6} y={gy + 4} fill="#6e7681" fontSize="10">
                ${calcPrice(valAtLine).toFixed(2)}
              </text>
            </g>
          );
        })}

        <line
          x1={padLeft}
          y1={avgY}
          x2={width - padRight}
          y2={avgY}
          stroke="#d29922"
          strokeWidth="1.5"
          strokeDasharray="5,5"
        />
        <rect x={width - padRight + 4} y={avgY - 9} width="52" height="18" rx="4" fill="#d29922" />
        <text
          x={width - padRight + 30}
          y={avgY + 3}
          textAnchor="middle"
          fill="#0d1117"
          fontSize="9"
          fontWeight="800"
        >
          AVG ${avgPrice.toFixed(1)}
        </text>

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

        <path d={areaPath} fill="url(#realAreaGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((c, idx) => (
          <circle
            key={idx}
            cx={c.x}
            cy={c.y}
            r={idx === activeIdx ? '6' : '2.8'}
            fill={strokeColor}
            stroke={idx === activeIdx ? '#0d1117' : 'none'}
            strokeWidth="2"
          />
        ))}

        {realHistory.length > 1 && (
          <>
            <text
              x={coords[highIdx].x}
              y={Math.max(12, coords[highIdx].y - 8)}
              textAnchor="middle"
              fill="#3fb950"
              fontSize="10"
              fontWeight="700"
            >
              HIGH {coords[highIdx].players.toLocaleString()}
            </text>
            <text
              x={coords[lowIdx].x}
              y={Math.min(height - 6, coords[lowIdx].y + 15)}
              textAnchor="middle"
              fill="#f85149"
              fontSize="10"
              fontWeight="700"
            >
              LOW {coords[lowIdx].players.toLocaleString()}
            </text>
          </>
        )}

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
        <span>Hover or click any point to inspect exact real player counts</span>
        <span>{series[series.length - 1]?.timeLabel}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [historyMap, setHistoryMap] = useState({});
  const [cash, setCash] = useState(() => {
    const saved = localStorage.getItem('gamestox_cash');
    return saved ? Number(saved) : 10000;
  });
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('gamestox_portfolio');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeTab, setActiveTab] = useState('market');
  const [filter, setFilter] = useState('all');
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [tradeAmount, setTradeAmount] = useState('500');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    localStorage.setItem('gamestox_cash', cash.toString());
  }, [cash]);

  useEffect(() => {
    localStorage.setItem('gamestox_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Real-time Firestore listener (auto-updates whenever the 24/7 collector writes new data)
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

  const enrichedGames = INITIAL_GAMES.map((g) => {
    const playersHistory = historyMap[g.id] || [];
    const len = playersHistory.length;
    const currentPlayers = len > 0 ? playersHistory[len - 1].players : 0;
    const openPlayers = len > 0 ? playersHistory[0].players : currentPlayers;

    const price = currentPlayers > 0 ? calcPrice(currentPlayers) : 0;
    const openPrice = openPlayers > 0 ? calcPrice(openPlayers) : price;
    const changePct =
      openPrice > 0 ? Number((((price - openPrice) / openPrice) * 100).toFixed(2)) : 0;

    return { ...g, playersHistory, currentPlayers, price, changePct };
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

  const handleBuy = (game, dollarAmt) => {
    const amount = Number(dollarAmt);
    if (!amount || amount <= 0 || amount > cash || game.price <= 0) return;
    const sharesBought = amount / game.price;

    setCash((c) => Number((c - amount).toFixed(2)));
    setPortfolio((prev) => {
      const existing = prev[game.id] || { shares: 0, totalCost: 0 };
      return {
        ...prev,
        [game.id]: {
          shares: existing.shares + sharesBought,
          totalCost: existing.totalCost + amount,
        },
      };
    });
  };

  const handleSell = (game, dollarAmt) => {
    const existing = portfolio[game.id];
    if (!existing || existing.shares <= 0 || game.price <= 0) return;

    const maxDollarValue = existing.shares * game.price;
    const sellDollars = Math.min(Number(dollarAmt), maxDollarValue);
    if (!sellDollars || sellDollars <= 0) return;

    const sharesSold = sellDollars / game.price;
    const fractionSold = sharesSold / existing.shares;
    const costRemoved = existing.totalCost * fractionSold;

    setCash((c) => Number((c + sellDollars).toFixed(2)));
    setPortfolio((prev) => {
      const remainingShares = existing.shares - sharesSold;
      if (remainingShares < 0.0001) {
        const copy = { ...prev };
        delete copy[game.id];
        return copy;
      }
      return {
        ...prev,
        [game.id]: {
          shares: remainingShares,
          totalCost: existing.totalCost - costRemoved,
        },
      };
    });
  };

  const resetAccount = () => {
    if (!window.confirm('Reset your cash back to $10,000 and clear all shares?')) return;
    setCash(10000);
    setPortfolio({});
  };

  const filteredGames = enrichedGames.filter((g) => {
    if (filter === 'gainers') return g.changePct > 0;
    if (filter === 'popular') return g.currentPlayers >= 100000;
    return true;
  });

  return (
    <div>
      <div className="ticker-bar">
        <span>🟢 24/7 CLOUD MARKET {lastUpdated ? `(Last Cloud Sync: ${lastUpdated})` : ''}:</span>
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
          <div className="stat-pill">
            <div className="stat-label">Available Cash</div>
            <div className="stat-value">
              ${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="stat-pill">
            <div className="stat-label">Net Worth</div>
            <div className="stat-value" style={{ color: '#58a6ff' }}>
              ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="stat-pill">
            <div className="stat-label">Cloud Status</div>
            <div className="stat-value" style={{ color: '#3fb950', fontSize: '0.9rem' }}>
              {isLoading ? 'Connecting...' : '● 24/7 Live'}
            </div>
          </div>
        </div>
      </nav>

      <div className="container">
        {activeTab === 'market' ? (
          <>
            <div className="controls-row">
              <h2>24/7 Live Game Stocks</h2>
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
                        backgroundImage: `url(${game.coverUrl}), ${game.gradient}`,
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
                            {game.ticker} • {game.source.toUpperCase()} LIVE
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
                          👥 {game.currentPlayers > 0 ? game.currentPlayers.toLocaleString() : '---'} real players
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
                  ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="summary-card">
                <h3>Invested Value</h3>
                <div className="big-num">
                  ${investedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      {h.shares.toFixed(3)} shares • Avg Buy: ${h.avgBuyPrice.toFixed(2)} • Live: $
                      {h.price.toFixed(2)} ({h.currentPlayers.toLocaleString()} real players)
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
                backgroundImage: `linear-gradient(to top, rgba(22,27,34,1) 5%, rgba(22,27,34,0.25) 100%), url(${selectedGame.coverUrl})`,
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
                  👥 {selectedGame.currentPlayers.toLocaleString()} Real Players • Share Price:{' '}
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
              />
            </div>

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
          </div>
        </div>
      )}
    </div>
  );
}