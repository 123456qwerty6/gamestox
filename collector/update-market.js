import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const rawSecret = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
const jsonString = rawSecret.startsWith('{') ? rawSecret : Buffer.from(rawSecret, 'base64').toString('utf8');
const serviceAccount = JSON.parse(jsonString);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

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
      const fromIso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const url = `https://api.fortnite.com/ecosystem/v1/metrics/minute/in-client-peak-ccu?from=${encodeURIComponent(fromIso)}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!res.ok) {
        console.warn(`Fortnite API HTTP ${res.status}`);
        return null;
      }

      const json = await res.json();
      const list = json?.intervals ?? json?.inClientPeakCcu ?? json?.data ?? (Array.isArray(json) ? json : []);
      const valid = list.filter((item) => typeof item?.value === 'number' && item.value > 0);
      const latest = valid[valid.length - 1];

      if (!latest) {
        console.warn('Fortnite returned no valid intervals');
        return null;
      }
      return latest.value;
    }
  } catch (e) {
    console.error(`Failed ${game.id}:`, e);
    return null;
  }
}

function findYesterdayPlayers(history, now) {
  const targetTime = now - TWENTY_FOUR_HOURS_MS;
  const maxDiffMs = 45 * 60 * 1000;
  let closest = null;
  let smallestDiff = Infinity;

  for (const entry of history) {
    if (!entry.timestamp || !entry.players) continue;
    const diff = Math.abs(entry.timestamp - targetTime);
    if (diff < smallestDiff && diff <= maxDiffMs) {
      smallestDiff = diff;
      closest = entry.players;
    }
  }
  return closest;
}

async function run() {
  const now = Date.now();
  const cutoff24h = now - TWENTY_FOUR_HOURS_MS;
  const cutoff48h = now - FORTY_EIGHT_HOURS_MS;

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

    const recent48h = existing
      .filter((entry) => !entry.timestamp || entry.timestamp >= cutoff48h)
      .slice(-575);

    const recent24h = recent48h.filter((entry) => !entry.timestamp || entry.timestamp >= cutoff24h);
    const all24hForAvg = [...recent24h, { players: count }];
    const rolling24hAvg = Math.round(
      all24hForAvg.reduce((sum, entry) => sum + entry.players, 0) / all24hForAvg.length
    );

    const yesterdayPlayers = findYesterdayPlayers(recent48h, now);
    let fairPlayers = rolling24hAvg;
    if (yesterdayPlayers && yesterdayPlayers > 0) {
      const ratio = Math.max(0.5, Math.min(2.0, count / yesterdayPlayers));
      fairPlayers = Math.round(rolling24hAvg * ratio);
    }

    const newTick = {
      players: count,
      yesterdayPlayers: yesterdayPlayers ?? null,
      rollingAvg: rolling24hAvg,
      fairPlayers,
      timeLabel: nowLabel,
      timestamp: now,
    };

    const updatedHistory = [...recent48h, newTick];

    await docRef.set(
      {
        history: updatedHistory,
        livePlayers: count,
        rolling24hPlayers: rolling24hAvg,
        fairPlayers,
        updatedAt: now,
      },
      { merge: true }
    );

    console.log(`Updated ${game.id}: live=${count}, yest=${yesterdayPlayers ?? 'n/a'}, fair=${fairPlayers}`);
  }
}

run();
