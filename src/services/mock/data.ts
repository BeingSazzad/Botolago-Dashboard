import type { AdminUser } from '@/components/auth/types'
import type { CmsPage, FaqItem } from '@/components/cms/types'
import type { Fixture, Gameweek } from '@/components/fixtures/types'
import type { NewsPost } from '@/components/news/types'
import type { Player } from '@/components/players/types'
import type { FantasyTeam, FantasyTeamDetail, SquadPlayer, User } from '@/components/users/types'
import { CLUBS, POSITIONS } from '@/lib/constants'
import { computeRating } from '@/lib/scoring'
import type { EntityStatus, MatchStats, PlayerStatus, Position } from '@/types/common.types'

/* ------------------------------------------------------------------ */
/* Seeded PRNG — keeps the demo data stable between reloads.           */
/* ------------------------------------------------------------------ */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20240601)
const rand = (min: number, max: number) => min + rng() * (max - min)
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1))
const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)]

/* Fixed reference "today" so deadlines / dates are deterministic. */
const NOW = new Date('2026-06-23T12:00:00Z').getTime()
const DAY = 86_400_000
const isoFrom = (offsetDays: number) => new Date(NOW + offsetDays * DAY).toISOString()

/* ------------------------------------------------------------------ */
/* Players                                                            */
/* ------------------------------------------------------------------ */
const FIRST = [
  'Achraf', 'Soufiane', 'Youssef', 'Ayoub', 'Yassine', 'Hamza', 'Zakaria', 'Mehdi',
  'Walid', 'Anas', 'Reda', 'Oussama', 'Ilias', 'Amine', 'Marouane', 'Karim',
  'Khalid', 'Said', 'Noussair', 'Tarik', 'Abderrazak', 'Badr', 'Hicham', 'Nabil',
]
const LAST = [
  'Rahimi', 'El Kaabi', 'Hafidi', 'Motrani', 'Benhalib', 'Jabrane', 'Nahiri', 'Moutouali',
  'Banoun', 'Chair', 'Ounahi', 'Aguerd', 'Saiss', 'Boufal', 'Harit', 'Amallah',
  'Ezzalzouli', 'El Khannous', 'Hadraf', 'Bencharki', 'Nakach', 'Founti', 'Khaloua', 'Mendyl',
]
const COUNTRIES = ['Morocco', 'Morocco', 'Morocco', 'Morocco', 'Senegal', 'Ivory Coast', 'DR Congo', 'Guinea', 'Mali', 'Cameroon', 'Tunisia', 'Comoros']

function randStats(position: Position): MatchStats {
  const attacking = position === 'Forward' || position === 'Midfielder'
  return {
    G: randInt(0, attacking ? 3 : 1),
    A: randInt(0, 2),
    CS: randInt(0, 1),
    SoT: randInt(0, attacking ? 5 : 2),
    T: position === 'Defender' || position === 'Midfielder' ? randInt(0, 6) : randInt(0, 2),
    S: position === 'Goalkeeper' ? randInt(1, 7) : 0,
    M: pick([0, 12, 30, 45, 67, 90, 90, 90]),
    YC: rng() > 0.8 ? 1 : 0,
    RC: rng() > 0.97 ? 1 : 0,
    OG: rng() > 0.98 ? 1 : 0,
  }
}

const PLAYER_STATUSES: PlayerStatus[] = [
  'available',
  'available',
  'available',
  'available',
  'doubtful',
  'injured',
  'suspended',
]

export const players: Player[] = Array.from({ length: 48 }).map((_, i) => {
  const position = POSITIONS[i % POSITIONS.length] as Position
  const club = pick(CLUBS)
  const stats = randStats(position)
  const { scoreOutOf10 } = computeRating(position, stats, {
    bonus: randInt(0, 3),
    difficulty: pick([0.9, 1, 1, 1.1, 1.2]),
  })
  return {
    id: `pl_${1000 + i}`,
    name: `${pick(FIRST)} ${pick(LAST)}`,
    club: club.name,
    clubShort: club.short,
    position,
    jerseyNumber: randInt(1, 33),
    nationality: pick(COUNTRIES),
    price: Number(rand(4, 14.5).toFixed(1)),
    totalPoints: randInt(20, 280),
    rating: scoreOutOf10,
    ownership: Number(rand(0.4, 62).toFixed(1)),
    status: pick(PLAYER_STATUSES),
    lastStats: stats,
    createdAt: isoFrom(-randInt(30, 320)),
  }
})

/* ------------------------------------------------------------------ */
/* Users + fantasy teams                                              */
/* ------------------------------------------------------------------ */
const TEAM_ADJ = ['Royal', 'Atomic', 'Phantom', 'Iron', 'Crimson', 'Golden', 'Mighty', 'Electric']
const TEAM_NOUN = ['Strikers', 'Rovers', 'Galaxy', 'Warriors', 'United', 'Dynamos', 'Kings', 'Wanderers']
const FORMATIONS = ['4-4-2', '4-3-3', '3-5-2', '3-4-3', '5-3-2', '4-5-1']
const USER_STATUSES: EntityStatus[] = ['active', 'active', 'active', 'inactive', 'suspended', 'banned']

export const users: User[] = Array.from({ length: 60 }).map((_, i) => {
  const first = pick(FIRST)
  const last = pick(LAST)
  const name = `${first} ${last}`
  const username = `${first.toLowerCase()}_${randInt(10, 999)}`
  return {
    id: `usr_${2000 + i}`,
    name,
    email: `${username}@botolago.app`,
    username,
    teamName: `${pick(TEAM_ADJ)} ${pick(TEAM_NOUN)}`,
    country: pick(COUNTRIES),
    status: pick(USER_STATUSES),
    totalPoints: randInt(120, 2200),
    rank: i + 1,
    leagues: randInt(0, 8),
    joinedAt: isoFrom(-randInt(20, 400)),
    lastActiveAt: isoFrom(-randInt(0, 14)),
  }
})
// Rank users by points descending so leaderboard is meaningful.
users.sort((a, b) => b.totalPoints - a.totalPoints).forEach((u, i) => (u.rank = i + 1))

export const teams: FantasyTeam[] = users.slice(0, 40).map((u, i) => {
  // Squad value + bank must equal the 100M-dirham budget cap (QA: keep them consistent).
  const squadValue = Number(rand(96, 99.9).toFixed(1))
  return {
    id: `team_${3000 + i}`,
    ownerId: u.id,
    ownerName: u.name,
    teamName: u.teamName,
    formation: pick(FORMATIONS),
    squadValue,
    budget: Number((100 - squadValue).toFixed(1)),
    points: u.totalPoints,
    gwPoints: randInt(18, 96),
    rank: i + 1,
  }
})

/* Players grouped by position for squad assembly. */
const playersByPosition: Record<string, Player[]> = {
  Goalkeeper: players.filter((p) => p.position === 'Goalkeeper'),
  Defender: players.filter((p) => p.position === 'Defender'),
  Midfielder: players.filter((p) => p.position === 'Midfielder'),
  Forward: players.filter((p) => p.position === 'Forward'),
}

/** Stable per-id seed so a team's squad never changes between loads. */
function hashSeed(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Build a full 15-man squad + metadata for a team. Deterministic per team id
 * (seeded by the id), independent of call order — mirrors what a real
 * `GET /teams/:id` would return, assembled from the player pool.
 */
export function getTeamDetail(teamId: string): FantasyTeamDetail | undefined {
  const team = teams.find((t) => t.id === teamId)
  if (!team) return undefined

  const r = mulberry32(hashSeed(teamId))
  const used = new Set<string>()
  const take = (pool: Player[], n: number): Player[] => {
    const available = pool.filter((p) => !used.has(p.id))
    const out: Player[] = []
    while (out.length < n && available.length) {
      const [p] = available.splice(Math.floor(r() * available.length), 1)
      used.add(p.id)
      out.push(p)
    }
    return out
  }

  const gks = take(playersByPosition.Goalkeeper, 2)
  const defs = take(playersByPosition.Defender, 5)
  const mids = take(playersByPosition.Midfielder, 5)
  const fwds = take(playersByPosition.Forward, 3)

  const [dN, mN, fN] = team.formation.split('-').map(Number)
  const byRating = (a: Player, b: Player) => b.rating - a.rating
  const starting = new Set<string>([
    ...gks.slice(0, 1),
    ...[...defs].sort(byRating).slice(0, dN),
    ...[...mids].sort(byRating).slice(0, mN),
    ...[...fwds].sort(byRating).slice(0, fN),
  ].map((p) => p.id))

  const all = [...gks, ...defs, ...mids, ...fwds]
  const starterRank = all.filter((p) => starting.has(p.id)).sort(byRating)
  const captainId = starterRank[0]?.id
  const viceId = starterRank[1]?.id

  const squad: SquadPlayer[] = all.map((p) => {
    const isStarting = starting.has(p.id)
    const isCaptain = p.id === captainId
    const raw = Math.round(p.rating * (isStarting ? (1 + r()) * 3 : r() * 2))
    return {
      id: p.id,
      name: p.name,
      club: p.club,
      clubShort: p.clubShort,
      position: p.position,
      isStarting,
      isCaptain,
      isViceCaptain: p.id === viceId,
      gwPoints: isCaptain ? raw * 2 : raw,
      rating: p.rating,
    }
  })

  const owner = users.find((u) => u.id === team.ownerId)
  return {
    ...team,
    squad,
    chipsUsed: r() > 0.6 ? ['Wildcard'] : r() > 0.5 ? ['Triple Captain'] : [],
    totalTransfers: Math.floor(r() * 40),
    joinedLeagues: owner?.leagues ?? 0,
    ownerEmail: owner?.email ?? '',
    ownerCountry: owner?.country ?? '',
  }
}

/* ------------------------------------------------------------------ */
/* Fixtures + gameweeks                                               */
/* ------------------------------------------------------------------ */
// 5 fixtures per gameweek across all 8 gameweeks (matches the Gameweeks list).
export const fixtures: Fixture[] = Array.from({ length: 40 }).map((_, i) => {
  const gw = Math.floor(i / 5) + 1
  let home = pick(CLUBS)
  let away = pick(CLUBS)
  while (away.short === home.short) away = pick(CLUBS)
  const dayOffset = (gw - 3) * 7 + (i % 5)
  const finished = dayOffset < 0
  const live = dayOffset === 0 && i % 5 === 0
  return {
    id: `fx_${4000 + i}`,
    gameweek: gw,
    homeClub: home.name,
    awayClub: away.name,
    homeShort: home.short,
    awayShort: away.short,
    homeScore: finished ? randInt(0, 4) : live ? randInt(0, 2) : null,
    awayScore: finished ? randInt(0, 4) : live ? randInt(0, 2) : null,
    kickoff: isoFrom(dayOffset),
    venue: `${home.name} Stadium`,
    status: finished ? 'finished' : live ? 'live' : 'scheduled',
    homeDifficulty: pick([0.9, 1, 1.1, 1.2]),
    awayDifficulty: pick([0.9, 1, 1.1, 1.2]),
  }
})

export const gameweeks: Gameweek[] = Array.from({ length: 8 }).map((_, i) => {
  const number = i + 1
  const offset = (number - 3) * 7
  const status = offset < -1 ? 'finished' : offset <= 1 ? 'live' : 'upcoming'
  return {
    id: `gw_${5000 + i}`,
    number,
    name: `Gameweek ${number}`,
    deadline: isoFrom(offset - 0.1),
    status,
    fixtures: 5,
    averagePoints: status === 'upcoming' ? 0 : randInt(38, 62),
    highestPoints: status === 'upcoming' ? 0 : randInt(88, 142),
    mostCaptained: pick(['Rahimi', 'El Kaabi', 'Hafidi', 'Benhalib', 'Moutouali']),
  }
})

/* ------------------------------------------------------------------ */
/* CMS pages + FAQ                                                    */
/* ------------------------------------------------------------------ */
export const cmsPages: CmsPage[] = [
  {
    id: 'cms_1',
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    body: '# Terms & Conditions\n\nWelcome to Botola Go. By creating an account you agree to the following terms...\n\n## 1. Eligibility\nYou must be 16 years or older to participate.\n\n## 2. Fair Play\nMultiple accounts and automated entries are prohibited.',
    status: 'published',
    updatedAt: isoFrom(-12),
    updatedBy: 'Super Admin',
  },
  {
    id: 'cms_2',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    body: '# Privacy Policy\n\nWe respect your privacy. This policy explains what data we collect and how we use it...\n\n## Data we collect\n- Account details\n- Gameplay statistics',
    status: 'published',
    updatedAt: isoFrom(-30),
    updatedBy: 'Content Editor',
  },
  {
    id: 'cms_3',
    slug: 'about',
    title: 'About Botola Go',
    body: "# About\n\nBotola Go is Morocco's most exciting way to play Botola Pro 1 fantasy football with friends.",
    status: 'draft',
    updatedAt: isoFrom(-3),
    updatedBy: 'Content Editor',
  },
  {
    id: 'cms_4',
    slug: 'how-to-play',
    title: 'How to Play',
    body: '# How to Play\n\n1. Pick your 15-player squad within budget.\n2. Choose a captain each gameweek.\n3. Make transfers and climb the leaderboard.',
    status: 'published',
    updatedAt: isoFrom(-6),
    updatedBy: 'Admin',
  },
]

export const faqs: FaqItem[] = [
  {
    id: 'faq_1',
    question: 'How are player points calculated?',
    answer:
      'Each player earns a base score from match events (goals, assists, clean sheets, etc.), weighted by position. Bonus points and an opponent difficulty multiplier are then applied, and the result is normalised to a 0–10 rating.',
    category: 'Scoring',
    order: 1,
    status: 'published',
  },
  {
    id: 'faq_2',
    question: 'When is the transfer deadline?',
    answer: 'The deadline is 90 minutes before the first kickoff of each gameweek.',
    category: 'Gameplay',
    order: 2,
    status: 'published',
  },
  {
    id: 'faq_3',
    question: 'How many free transfers do I get?',
    answer: 'You receive one free transfer per gameweek. Additional transfers cost 4 points each.',
    category: 'Gameplay',
    order: 3,
    status: 'published',
  },
  {
    id: 'faq_4',
    question: 'Can I create a private league?',
    answer: 'Yes. Go to Leagues → Create and share the invite code with friends.',
    category: 'Leagues',
    order: 4,
    status: 'draft',
  },
]

/* ------------------------------------------------------------------ */
/* News / Blog                                                        */
/* ------------------------------------------------------------------ */
const NEWS_IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`

export const newsPosts: NewsPost[] = [
  {
    id: 'news_1',
    source: 'admin',
    title: 'Raja Casablanca clinch derby thriller against Wydad',
    slug: 'raja-clinch-derby-thriller',
    excerpt: 'A late winner settles a tense Casablanca derby as Raja edge Wydad in front of a packed stadium.',
    body: '# Derby drama\n\nRaja Casablanca secured a dramatic victory in the Casablanca derby thanks to a stoppage-time strike.\n\nThe result tightens the title race at the top of Botola Pro 1.',
    coverImage: NEWS_IMG('photo-1522778119026-d647f0596c20'),
    category: 'Match Report',
    status: 'published',
    author: 'Salma Bennani',
    publishedAt: isoFrom(-0.2),
    updatedAt: isoFrom(-0.2),
  },
  {
    id: 'news_2',
    source: 'feed',
    title: 'AS FAR extend lead at the top of Botola Pro 1',
    slug: 'as-far-extend-lead',
    excerpt: 'The Rabat side make it five wins in a row to open up a commanding gap at the summit.',
    body: '# Flying high\n\nAS FAR continue their excellent form with another commanding performance.',
    coverImage: NEWS_IMG('photo-1551958219-acbc608c6377'),
    category: 'League News',
    status: 'published',
    author: 'Youssef Idrissi',
    publishedAt: isoFrom(-1),
    updatedAt: isoFrom(-1),
  },
  {
    id: 'news_3',
    source: 'admin',
    title: 'Soufiane Rahimi linked with a summer move',
    slug: 'rahimi-summer-move',
    excerpt: 'The prolific forward is attracting interest from abroad after another standout campaign.',
    body: '# Transfer buzz\n\nReports suggest several clubs are monitoring the in-form striker ahead of the window.',
    coverImage: NEWS_IMG('photo-1431324155629-1a6deb1dec8d'),
    category: 'Transfers',
    status: 'published',
    author: 'Salma Bennani',
    publishedAt: isoFrom(-2),
    updatedAt: isoFrom(-2),
  },
  {
    id: 'news_4',
    source: 'feed',
    title: 'RS Berkane gear up for CAF Confederation Cup',
    slug: 'berkane-caf-confederation',
    excerpt: 'Berkane turn their attention to continental action with a strong squad available.',
    body: '# Continental focus\n\nRS Berkane prepare for a crucial continental fixture this weekend.',
    coverImage: NEWS_IMG('photo-1577223625816-7546f13df25d'),
    category: 'Continental',
    status: 'published',
    author: 'Youssef Idrissi',
    publishedAt: isoFrom(-3),
    updatedAt: isoFrom(-3),
  },
  {
    id: 'news_5',
    source: 'feed',
    title: 'Botola Pro 1 announces new VAR rollout',
    slug: 'botola-var-rollout',
    excerpt: 'The league confirms expanded VAR coverage across all top-flight fixtures from next round.',
    body: '# Technology upgrade\n\nThe federation has confirmed an expanded VAR programme for the league.',
    coverImage: NEWS_IMG('photo-1493924191705-d3f7d3df7f8f'),
    category: 'League News',
    status: 'draft',
    author: 'Imane Alaoui',
    publishedAt: isoFrom(-4),
    updatedAt: isoFrom(-1),
  },
  {
    id: 'news_6',
    source: 'admin',
    title: 'Hassania Agadir confirm key striker returns from injury',
    slug: 'hassania-striker-returns',
    excerpt: 'A welcome boost for Agadir as their forward is passed fit ahead of a busy schedule.',
    body: '# Fit again\n\nHassania Agadir confirm their forward has recovered and is available for selection.',
    coverImage: NEWS_IMG('photo-1459865264687-595d652de67e'),
    category: 'Injury News',
    status: 'published',
    author: 'Salma Bennani',
    publishedAt: isoFrom(-5),
    updatedAt: isoFrom(-5),
  },
]

/* ------------------------------------------------------------------ */
/* Admins                                                             */
/* ------------------------------------------------------------------ */
export const admins: AdminUser[] = [
  {
    id: 'adm_1',
    name: 'Riad El Mansouri',
    email: 'binarybards27@gmail.com',
    role: 'super_admin',
    roleName: 'Super Admin',
    permissions: '*',
    status: 'active',
    lastLoginAt: isoFrom(0),
    createdAt: isoFrom(-365),
  },
  {
    id: 'adm_2',
    name: 'Salma Bennani',
    email: 'salma@botolago.app',
    role: 'admin',
    roleName: 'Admin',
    permissions: [],
    status: 'active',
    lastLoginAt: isoFrom(-1),
    createdAt: isoFrom(-200),
  },
  {
    id: 'adm_3',
    name: 'Youssef Idrissi',
    email: 'youssef@botolago.app',
    role: 'editor',
    roleName: 'Content Editor',
    permissions: [],
    status: 'active',
    lastLoginAt: isoFrom(-4),
    createdAt: isoFrom(-90),
  },
  {
    id: 'adm_4',
    name: 'Imane Alaoui',
    email: 'imane@botolago.app',
    role: 'analyst',
    roleName: 'Analyst',
    permissions: [],
    status: 'invited',
    lastLoginAt: isoFrom(-30),
    createdAt: isoFrom(-30),
  },
]

/* ------------------------------------------------------------------ */
/* Dashboard analytics aggregates                                     */
/* ------------------------------------------------------------------ */
export const dashboardStats = {
  totalUsers: 48230,
  usersDelta: 12.4,
  activeTeams: 41096,
  teamsDelta: 8.1,
  totalPlayers: players.length,
  playersDelta: 2.2,
  liveFixtures: fixtures.filter((f) => f.status === 'live').length,
  fixturesDelta: 0,
  revenue: 86420,
  revenueDelta: 18.7,
}

export const signupTrend = [
  { label: 'Jan', users: 3200, active: 2400 },
  { label: 'Feb', users: 4100, active: 3100 },
  { label: 'Mar', users: 5300, active: 4200 },
  { label: 'Apr', users: 6900, active: 5600 },
  { label: 'May', users: 8400, active: 7100 },
  { label: 'Jun', users: 11200, active: 9300 },
]

export const positionBreakdown = POSITIONS.map((p) => ({
  name: p,
  value: players.filter((pl) => pl.position === p).length,
}))

export const pointsDistribution = [
  { range: '0–500', users: 8200 },
  { range: '500–1k', users: 14300 },
  { range: '1k–1.5k', users: 11900 },
  { range: '1.5k–2k', users: 9100 },
  { range: '2k+', users: 4730 },
]

export const recentActivity = [
  { id: 'a1', actor: 'Salma Bennani', action: 'updated player', target: 'Soufiane Rahimi', at: isoFrom(0) },
  { id: 'a2', actor: 'System', action: 'closed deadline for', target: 'Gameweek 3', at: isoFrom(0) },
  { id: 'a3', actor: 'Youssef Idrissi', action: 'published', target: 'How to Play', at: isoFrom(-1) },
  { id: 'a4', actor: 'Riad El Mansouri', action: 'invited admin', target: 'Imane Alaoui', at: isoFrom(-2) },
  { id: 'a5', actor: 'System', action: 'finalised scores for', target: 'Gameweek 2', at: isoFrom(-3) },
]

/* ------------------------------------------------------------------ */
/* Live sports DATA FEED (everything an external API would deliver).  */
/* The dashboard surfaces these read-only — admins monitor, not edit. */
/* ------------------------------------------------------------------ */

/** Health of the external data-feed integration. */
export const dataFeed = {
  provider: 'Opta Sports',
  status: 'connected' as 'connected' | 'degraded' | 'down',
  lastSyncMinutes: 2,
  recordsToday: 18430,
  latencyMs: 142,
  uptimePct: 99.98,
  autoSync: true,
  currentGameweek: 3,
}

export interface MatchdayFixture {
  id: string
  homeClub: string
  awayClub: string
  homeShort: string
  awayShort: string
  homeScore: number | null
  awayScore: number | null
  status: 'live' | 'upcoming' | 'finished'
  minute: number | null
  kickoff: string | null
}

/** Today's matchday — live scores + minute come straight from the feed. */
export const matchday: MatchdayFixture[] = [
  { id: 'md1', homeClub: 'Raja Casablanca', awayClub: 'Wydad AC', homeShort: 'RCA', awayShort: 'WAC', homeScore: 1, awayScore: 1, status: 'live', minute: 67, kickoff: null },
  { id: 'md2', homeClub: 'AS FAR', awayClub: 'RS Berkane', homeShort: 'FAR', awayShort: 'RSB', homeScore: 2, awayScore: 0, status: 'live', minute: 54, kickoff: null },
  { id: 'md3', homeClub: 'FUS Rabat', awayClub: 'Maghreb Fès', homeShort: 'FUS', awayShort: 'MAS', homeScore: null, awayScore: null, status: 'upcoming', minute: null, kickoff: isoFrom(0.12) },
  { id: 'md4', homeClub: 'Hassania Agadir', awayClub: 'Olympique Safi', homeShort: 'HUS', awayShort: 'OCS', homeScore: null, awayScore: null, status: 'upcoming', minute: null, kickoff: isoFrom(0.22) },
  { id: 'md5', homeClub: 'Moghreb Tétouan', awayClub: 'Difaâ El Jadida', homeShort: 'MAT', awayShort: 'DHJ', homeScore: 1, awayScore: 2, status: 'finished', minute: null, kickoff: isoFrom(-0.1) },
  { id: 'md6', homeClub: 'Chabab Mohammédia', awayClub: 'Mouloudia Oujda', homeShort: 'CHM', awayShort: 'MCO', homeScore: 0, awayScore: 0, status: 'finished', minute: null, kickoff: isoFrom(-0.2) },
]

export interface PerformerRow {
  id: string
  name: string
  club: string
  clubShort: string
  position: Position
  points: number
  goals: number
  assists: number
  bonus: number
}

// Players flagged unavailable (injured/suspended) — excluded from performers (QA).
const unavailablePlayerIds = new Set([4, 9, 14, 21, 27].map((i) => players[i % players.length].id))

/** Top fantasy scorers this gameweek — only players who actually played. */
export const topPerformers: PerformerRow[] = players
  .filter((p) => p.lastStats.M > 0 && !unavailablePlayerIds.has(p.id))
  .map((p) => ({
    id: p.id,
    name: p.name,
    club: p.club,
    clubShort: p.clubShort,
    position: p.position,
    goals: p.lastStats.G,
    assists: p.lastStats.A,
    bonus: randInt(0, 3),
    points: Math.round(p.rating * 3 + p.lastStats.G * 4 + p.lastStats.A * 2 + p.lastStats.CS * 2),
  }))
  .sort((a, b) => b.points - a.points)
  .slice(0, 6)

export interface AvailabilityRow {
  id: string
  name: string
  clubShort: string
  position: Position
  status: 'injured' | 'suspended' | 'doubtful'
  news: string
  chance: number
  updatedMinutes: number
}

const availabilitySource: { idx: number; status: AvailabilityRow['status']; news: string; chance: number; updatedMinutes: number }[] = [
  { idx: 4, status: 'injured', news: 'Hamstring strain — out ~3 weeks', chance: 0, updatedMinutes: 35 },
  { idx: 9, status: 'doubtful', news: 'Knock in training — late fitness test', chance: 50, updatedMinutes: 95 },
  { idx: 14, status: 'suspended', news: 'Serving 1-match ban (red card)', chance: 0, updatedMinutes: 220 },
  { idx: 21, status: 'doubtful', news: 'Illness — monitored daily', chance: 75, updatedMinutes: 18 },
  { idx: 27, status: 'injured', news: 'Ankle injury — assessed daily', chance: 25, updatedMinutes: 310 },
]

export const availability: AvailabilityRow[] = availabilitySource.map((a, i) => {
  const p = players[a.idx % players.length]
  return {
    id: `av_${i}`,
    name: p.name,
    clubShort: p.clubShort,
    position: p.position,
    status: a.status,
    news: a.news,
    chance: a.chance,
    updatedMinutes: a.updatedMinutes,
  }
})

export interface MoverRow {
  id: string
  name: string
  clubShort: string
  position: Position
  direction: 'up' | 'down'
  priceChange: number
  ownership: number
  netTransfers: number
}

/** Biggest price/ownership movers from the feed (transfer market). */
export const priceMovers: MoverRow[] = [...players]
  .sort((a, b) => b.ownership - a.ownership)
  .slice(0, 6)
  .map((p, i) => ({
    id: `mv_${i}`,
    name: p.name,
    clubShort: p.clubShort,
    position: p.position,
    direction: i % 3 === 0 ? 'down' : 'up',
    priceChange: Number((i % 3 === 0 ? -0.1 : 0.1).toFixed(1)),
    ownership: p.ownership,
    netTransfers: (i % 3 === 0 ? -1 : 1) * randInt(8000, 92000),
  }))

export interface StandingRow {
  pos: number
  club: string
  short: string
  played: number
  won: number
  drawn: number
  lost: number
  gd: number
  points: number
}

/** League table snapshot — the classic API-sourced standings. */
export const standings: StandingRow[] = CLUBS.slice(0, 6).map((c, i) => {
  const played = 6
  const won = 5 - i
  const drawn = i % 2
  const lost = played - won - drawn
  return {
    pos: i + 1,
    club: c.name,
    short: c.short,
    played,
    won,
    drawn,
    lost,
    gd: (won - lost) * 2 + drawn,
    points: won * 3 + drawn,
  }
})

/** Look up a team detail by the owning user's id (for the Users → team view). */
export function getTeamDetailByOwner(ownerId: string): FantasyTeamDetail | undefined {
  const team = teams.find((t) => t.ownerId === ownerId)
  return team ? getTeamDetail(team.id) : undefined
}
