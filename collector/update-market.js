import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const rawSecret = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
const jsonString = rawSecret.startsWith('{') ? rawSecret : Buffer.from(rawSecret, 'base64').toString('utf8');
const serviceAccount = JSON.parse(jsonString);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const GAMES = [
  { id: 'fortnite', source: 'fortnite' },
  { id: 'cs2', source: 'steam', appId: 730 },
  { id: 'pubg', source: 'steam', appId: 578080 },
  { id: 'dota2', source: 'steam', appId: 570 },
  { id: 'rivals', source: 'steam', appId: 2767030 },
  { id: 'minecraft', source: 'minecraft', serverIp: 'mc.hypixel.net' },
  { id: 'apex', source: 'steam', appId: 1172470 },
  { id: 'rust', source: 'steam', appId: 252490 },
  { id: 'hd2', source: 'steam', appId: 553850 },
  { id: 'elden', source: 'steam', appId: 1245620 },
  { id: 'balatro', source: 'steam', appId: 2379780 },
  { id: 'gtav', source: 'steam', appId: 271590 },
  { id: 'cod', source: 'steam', appId: 1938090 },
  { id: 'tf2', source: 'steam', appId: 440 },
  { id: 'dbd', source: 'steam', appId: 381210 },
  { id: 'warframe', source: 'steam', appId: 230410 },
  { id: 'bg3', source: 'steam', appId: 1086940 },
  { id: 'bloxfruits', source: 'roblox', universeId: 994732206 },
  { id: 'brookhaven', source: 'roblox', universeId: 1686885941 },
];

async function getCount(game) {
  try {
    if (game.source === 'steam') {
      const res = await fetch(
        `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${game.appId}`
      );
      const json = await res.json();
      return json?.response?.player_count ?? null;
    }
    if (game.source === 'minecraft') {
      const res = await fetch(`https://api.mcsrvstat.us/3/${game.serverIp}`);
      const json = await res.json();
      return json?.players?.online ?? null;
    }
    if (game.source === 'roblox') {
      const res = await fetch(
        `https://games.roblox.com/v1/games?universeIds=${game.universeId}`
      );
      const json = await res.json();
      return json?.data?.[0]?.playing ?? null;
    }
    if (game.source === 'fortnite') {
      const playlists = [
        'playlist_defaultsolo',
        'playlist_defaultduo',
        'playlist_trios',
        'playlist_defaultsquad',
        'playlist_nobuildbr_solo',
        'playlist_nobuildbr_duo',
        'playlist_nobuildbr_trio',
        'playlist_nobuildbr_squad',
        'playlist_blastberry_solo',
        'playlist_blastberry_duo',
        'playlist_blastberry_squad',
        'playlist_ranked_solo',
        'playlist_ranked_duo',
        'playlist_ranked_squad',
      ];

      const fromIso = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      let totalCcu = 0;

      for (const code of playlists) {
        try {
          const url = `https://api.fortnite.com/ecosystem/v1/islands/${code}/metrics/minute/peak-ccu?from=${encodeURIComponent(fromIso)}`;
          const res = await fetch(url, {
            headers: { Accept: 'application/json' },
          });
          if (!res.ok) continue;
          const json = await res.json();
          const intervals = json?.intervals ?? [];
          const latest = intervals[intervals.length - 1];
          if (latest && typeof latest.value === 'number' && latest.value > 0) {
            totalCcu += latest.value;
          }
        } catch {
          // Skip individual playlist timeout and keep summing the rest
        }
      }

      if (totalCcu > 0) {
        return totalCcu;
      }

      console.warn('Fortnite Epic API returned 0 across playlists');
      return null;
    }
  } catch (e) {
    console.error(`Failed ${game.id}:`, e);
    return null;
  }
}

async function run() {
  const now = Date.now();
  const cutoff24h = now - TWENTY_FOUR_HOURS_MS;

  const nowLabel = new Date(now).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jerusalem',
  });

  for (const game of GAMES) {
    const count = await getCount(game);
    if (!count || count <= 0) continue;

    const docRef = db.collection('market').doc(game.id);
    const snap = await docRef.get();
    const existing = snap.exists ? snap.data().history || [] : [];

    const recentTicks = existing
      .filter((entry) => !entry.timestamp || entry.timestamp >= cutoff24h)
      .slice(-287);

    const allTicksForAvg = [...recentTicks, { players: count }];
    const rolling24hAvg = Math.round(
      allTicksForAvg.reduce((sum, entry) => sum + entry.players, 0) / allTicksForAvg.length
    );

    const newTick = {
      players: count,
      rollingAvg: rolling24hAvg,
      timeLabel: nowLabel,
      timestamp: now,
    };

    const updatedHistory = [...recentTicks, newTick];

    await docRef.set(
      {
        history: updatedHistory,
        livePlayers: count,
        rolling24hPlayers: rolling24hAvg,
        updatedAt: now,
      },
      { merge: true }
    );

    console.log(`Updated ${game.id}: live=${count}, 24hAvg=${rolling24hAvg}`);
  }
}

run();
