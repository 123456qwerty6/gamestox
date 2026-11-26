import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const rawSecret = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
const jsonString = rawSecret.startsWith('{') ? rawSecret : Buffer.from(rawSecret, 'base64').toString('utf8');
const serviceAccount = JSON.parse(jsonString);
console.log('PROJECT:', serviceAccount.project_id);
console.log('KEY LENGTH:', serviceAccount.private_key?.length);
console.log('STARTS WITH:', JSON.stringify(serviceAccount.private_key?.slice(0, 35)));
console.log('ENDS WITH:', JSON.stringify(serviceAccount.private_key?.slice(-35)));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const GAMES = [
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
  } catch (e) {
    console.error(`Failed ${game.id}:`, e);
    return null;
  }
}

async function run() {
  const nowLabel = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC';

  for (const game of GAMES) {
    const count = await getCount(game);
    if (!count || count <= 0) continue;

    const docRef = db.collection('market').doc(game.id);
    const snap = await docRef.get();
    const existing = snap.exists ? snap.data().history || [] : [];

    const updatedHistory = [...existing.slice(-287), { players: count, timeLabel: nowLabel }];
    await docRef.set({ history: updatedHistory, updatedAt: Date.now() }, { merge: true });
    console.log(`Updated ${game.id}: ${count}`);
  }
}

run();
