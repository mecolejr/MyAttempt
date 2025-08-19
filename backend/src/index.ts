import express from 'express';
// no Express type imports; keep handlers untyped to avoid TS build issues in Docker
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { computeTruePlaceScore } from './scoring.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

// In-memory cache for profile scores
type ScoresCacheEntry = { fingerprint: string; valuesDiversity: boolean; results: any[]; ts: number };
const scoresCache = new Map<string, ScoresCacheEntry>();
const CACHE_TTL_MS = process.env.CACHE_TTL_MS ? Number(process.env.CACHE_TTL_MS) : 10 * 60 * 1000;

async function computeDatasetFingerprint(): Promise<string> {
  const [locationsCount, hateCrimesCount, crimeStatsCount, demographicsCount] = await Promise.all([
    prisma.location.count(),
    prisma.hateCrime.count(),
    prisma.crimeStats.count(),
    prisma.demographics.count(),
  ]);
  const [hateSum, violentSum, propertySum] = await Promise.all([
    prisma.hateCrime.aggregate({ _sum: { incidents: true } }),
    prisma.crimeStats.aggregate({ _sum: { violentRate: true } }),
    prisma.crimeStats.aggregate({ _sum: { propertyRate: true } }),
  ]);
  const payload = {
    counts: { locations: locationsCount, hateCrimes: hateCrimesCount, crimeStats: crimeStatsCount, demographics: demographicsCount },
    sums: {
      hateCrimesIncidents: hateSum._sum.incidents ?? 0,
      violentRate: violentSum._sum.violentRate ?? 0,
      propertyRate: propertySum._sum.propertyRate ?? 0,
    },
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 12);
}

app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean) || '*' } as any));
app.use(express.json({ limit: '256kb' }));

// Startup banner for live data keys
(() => {
  const missing: string[] = [];
  if (!process.env.FBI_API_KEY) missing.push('FBI_API_KEY');
  if (!process.env.CENSUS_API_KEY) missing.push('CENSUS_API_KEY');
  if (missing.length > 0) {
    console.warn(
      `\n[TruePlace] Live data keys missing: ${missing.join(', ')}.\n` +
        '- Using stubbed CSV data. To refresh: `pnpm data:refresh`.\n' +
        '- To enable live fetchers, set keys in `backend/.env`.\n'
    );
  }
})();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Readiness probe (checks DB)
app.get('/ready', async (_req, res) => {
  try {
    await prisma.location.count()
    res.json({ ready: true })
  } catch {
    res.status(503).json({ ready: false })
  }
})

// Dev-only auth helpers
function emailFromToken(token?: string | null): string | null {
  if (!token) return null
  if (token.startsWith('dev:')) {
    try { return Buffer.from(token.slice(4), 'base64').toString('utf8') } catch { return null }
  }
  return null
}

const memFavorites = new Map<string, Set<number>>()

app.post('/api/auth/dev-login', async (req, res) => {
  try {
    if (process.env.DEV_AUTH !== 'true' && !process.env.VITEST_WORKER_ID) return res.status(403).json({ error: 'disabled' })
    const emailRaw = req.body?.email
    if (typeof emailRaw !== 'string') return res.status(400).json({ error: 'email required' })
    const email = emailRaw.trim().toLowerCase()
    const nameVal = req.body?.name
    const name = typeof nameVal === 'string' && nameVal.trim().length > 0 ? nameVal.trim() : null
    if (!email) return res.status(400).json({ error: 'email required' })
    const token = `dev:${Buffer.from(email, 'utf8').toString('base64')}`
    // Best effort DB upsert
    try {
      await prisma.user.upsert({
        where: { email },
        update: { name: name || undefined },
        create: { email, name },
      } as any)
    } catch {}
    return res.json({ token })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/favorites', async (req, res) => {
  try {
    const email = emailFromToken(req.get('x-auth-token'))
    if (!email) return res.status(401).json({ error: 'unauthorized' })
    // Try DB first
    try {
      const user = await (prisma.user as any).findUnique({ where: { email }, select: { id: true } })
      if (user) {
        const favs = await (prisma.favorite as any).findMany({ where: { userId: user.id }, select: { locationId: true } })
        return res.json({ favorites: favs.map((f: any) => f.locationId) })
      }
    } catch {}
    // Fallback to memory
    const set = memFavorites.get(email) || new Set<number>()
    return res.json({ favorites: Array.from(set) })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/favorites', async (req, res) => {
  try {
    const email = emailFromToken(req.get('x-auth-token'))
    if (!email) return res.status(401).json({ error: 'unauthorized' })
    const locationIdVal = req.body?.locationId
    const locationId = typeof locationIdVal === 'number' ? locationIdVal : Number(locationIdVal)
    if (!Number.isFinite(locationId)) return res.status(400).json({ error: 'invalid locationId' })
    // Try DB first
    try {
      const user = await (prisma.user as any).upsert({ where: { email }, update: {}, create: { email } })
      await (prisma.favorite as any).upsert({
        where: { userId_locationId: { userId: user.id, locationId } },
        update: {},
        create: { userId: user.id, locationId },
      })
      return res.json({ ok: true })
    } catch {}
    // Fallback memory
    const set = memFavorites.get(email) || new Set<number>()
    set.add(locationId)
    memFavorites.set(email, set)
    return res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/favorites/:locationId', async (req, res) => {
  try {
    const email = emailFromToken(req.get('x-auth-token'))
    if (!email) return res.status(401).json({ error: 'unauthorized' })
    const locationId = Number(req.params.locationId)
    if (!Number.isFinite(locationId)) return res.status(400).json({ error: 'invalid locationId' })
    // Try DB
    try {
      const user = await (prisma.user as any).findUnique({ where: { email }, select: { id: true } })
      if (user) {
        await (prisma.favorite as any).deleteMany({ where: { userId: user.id, locationId } })
        return res.json({ ok: true })
      }
    } catch {}
    // Memory
    const set = memFavorites.get(email)
    if (set) set.delete(locationId)
    return res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/profile', async (req, res) => {
  try {
    const email = emailFromToken(req.get('x-auth-token'))
    if (!email) return res.status(401).json({ error: 'unauthorized' })
    try {
      const user = await (prisma.user as any).findUnique({ where: { email }, select: { id: true } })
      if (!user) return res.json({ data: null })
      const prof = await ((prisma as any).profile).findUnique({ where: { userId: user.id } } as any)
      return res.json({ data: prof?.data ?? null })
    } catch {
      return res.json({ data: null })
    }
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/profile', async (req, res) => {
  try {
    const email = emailFromToken(req.get('x-auth-token'))
    if (!email) return res.status(401).json({ error: 'unauthorized' })
    const data = req.body?.data
    if (typeof data !== 'object' || data == null) return res.status(400).json({ error: 'invalid data' })
    // Basic shape guard
    const allowKeys = new Set(['valuesDiversity','minSafety','minCommunity','limit','sortBy','sortDir','biasTypes','stateFilter','query'])
    for (const k of Object.keys(data)) {
      if (!allowKeys.has(k)) return res.status(400).json({ error: 'invalid key' })
    }
    try {
      const user = await (prisma.user as any).upsert({ where: { email }, update: {}, create: { email } })
      const prof = await ((prisma as any).profile).upsert({
        where: { userId: user.id },
        update: { data },
        create: { userId: user.id, data },
      } as any)
      return res.json({ data: prof.data })
    } catch {
      return res.status(500).json({ error: 'persist failed' })
    }
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/locations', async (_req, res) => {
  try {
    const locations = await prisma.location.findMany({ select: { id: true, name: true, state: true } });
    res.json({ locations });
  } catch (e: any) {
    console.error(JSON.stringify({ level: 'error', msg: 'locations_failed', err: String(e?.message || e) }))
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/score', async (req, res) => {
  try {
    const location = String(req.query.location || '');
    if (!location) {
      return res.status(400).json({ error: 'location is required' });
    }

    const record = await prisma.location.findFirst({
      where: { name: { equals: location, mode: 'insensitive' } },
    });

    if (!record) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const { score, breakdown, subScores, citations } = computeTruePlaceScore(record, {
      valuesDiversity: String(req.query.valuesDiversity || '') === 'true',
    });

    return res.json({
      location: record.name,
      state: record.state,
      score,
      breakdown,
      subScores,
      citations,
    });
  } catch (err: any) {
    console.error(JSON.stringify({ level: 'error', msg: 'score_failed', err: String(err?.message || err) }))
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/profile-scores', async (req, res) => {
  try {
    const valuesDiversity = String(req.query.valuesDiversity || '') === 'true'
    const nocache = String(req.query.nocache || '') === 'true'
    const minSafety = req.query.minSafety ? Number(req.query.minSafety) : undefined
    const minCommunity = req.query.minCommunity ? Number(req.query.minCommunity) : undefined
    const limit = req.query.limit ? Math.max(1, Math.min(100, Number(req.query.limit))) : 50
    const offset = req.query.offset ? Math.max(0, Number(req.query.offset)) : 0
    const sortBy = (String(req.query.sortBy || 'score') as 'score' | 'safety' | 'community')
    const sortDir = (String(req.query.sortDir || 'desc') as 'asc' | 'desc')
    const rawBias = (req.query as any).biasType as unknown
    let biasTypes: string[] = []
    if (Array.isArray(rawBias)) biasTypes = (rawBias as any[]).map((v) => String(v))
    else if (rawBias != null) biasTypes = [String(rawBias)]
    const stateFilter = (String(req.query.state || '').trim().toUpperCase())
    const q = String(req.query.q || '').trim().toLowerCase()

    const fingerprint = await computeDatasetFingerprint()
    const keyObj = { valuesDiversity, minSafety, minCommunity, sortBy, sortDir, biasTypes, stateFilter, q }
    const cacheKey = `${fingerprint}:${JSON.stringify(keyObj)}`

    if (!nocache) {
      const hit = scoresCache.get(cacheKey)
      if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
        return res.json({ results: hit.results, cache: { hit: true, key: cacheKey, ttlMs: CACHE_TTL_MS } })
      }
    }

    const records = await prisma.location.findMany()
    let biasIncidentByLoc = new Map<number, number>()
    if (biasTypes.length > 0) {
      const grouped = await prisma.hateCrime.groupBy({
        by: ['locationId'],
        where: { biasType: { in: biasTypes } },
        _sum: { incidents: true },
      })
      for (const g of grouped) biasIncidentByLoc.set(g.locationId as number, (g._sum.incidents as number) || 0)
    }
    let results = records.map((r) => ({
      id: r.id,
      name: r.name,
      state: r.state,
      ...computeTruePlaceScore(r, { valuesDiversity }),
      ...(biasTypes.length > 0 ? { biasIncidents: biasIncidentByLoc.get(r.id) } : {}),
    }))
    // Filter
    if (typeof minSafety === 'number') {
      results = results.filter((r) => r.subScores?.safety >= minSafety)
    }
    if (typeof minCommunity === 'number') {
      results = results.filter((r) => r.subScores?.community >= minCommunity)
    }
    if (biasTypes.length > 0) {
      // Only keep locations that have data for the requested biases
      results = results.filter((r: any) => typeof r.biasIncidents === 'number')
    }
    if (stateFilter) {
      results = results.filter((r) => r.state.toUpperCase() === stateFilter)
    }
    if (q) {
      results = results.filter((r) => `${r.name}, ${r.state}`.toLowerCase().includes(q))
    }
    // Sort
    results.sort((a, b) => {
      const av = sortBy === 'score' ? a.score : sortBy === 'safety' ? a.subScores?.safety ?? 0 : a.subScores?.community ?? 0
      const bv = sortBy === 'score' ? b.score : sortBy === 'safety' ? b.subScores?.safety ?? 0 : b.subScores?.community ?? 0
      return sortDir === 'asc' ? av - bv : bv - av
    })

    scoresCache.set(cacheKey, { fingerprint, valuesDiversity, results, ts: Date.now() })
    const paged = results.slice(offset, offset + limit)
    res.json({ results: paged, total: results.length, page: { limit, offset }, cache: { hit: false, key: cacheKey, ttlMs: CACHE_TTL_MS } })
  } catch (e: any) {
    console.error(JSON.stringify({ level: 'error', msg: 'profile_scores_failed', err: String(e?.message || e) }))
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin: dataset snapshot
app.get('/api/admin/dataset', async (req, res) => {
  try {
    const token = process.env.ADMIN_TOKEN
    if (token && req.get('x-admin-token') !== token) {
      return res.status(403).json({ error: 'forbidden' })
    }

    const [locationsCount, hateCrimesCount, crimeStatsCount, demographicsCount] = await Promise.all([
      prisma.location.count(),
      prisma.hateCrime.count(),
      prisma.crimeStats.count(),
      prisma.demographics.count(),
    ])

    const [hateSum, violentSum, propertySum] = await Promise.all([
      prisma.hateCrime.aggregate({ _sum: { incidents: true } }),
      prisma.crimeStats.aggregate({ _sum: { violentRate: true } }),
      prisma.crimeStats.aggregate({ _sum: { propertyRate: true } }),
    ])

    const [hateMax, crimeMax, demoMax] = await Promise.all([
      prisma.hateCrime.aggregate({ _max: { updatedAt: true } }),
      prisma.crimeStats.aggregate({ _max: { updatedAt: true } }),
      prisma.demographics.aggregate({ _max: { updatedAt: true } }),
    ])

    const citations = [
      'Safety: FBI Crime Data API (UCR/Hate Crimes)',
      'Community: U.S. Census Bureau ACS (Diversity Index)'
    ]

    const payload = {
      counts: { locations: locationsCount, hateCrimes: hateCrimesCount, crimeStats: crimeStatsCount, demographics: demographicsCount },
      sums: {
        hateCrimesIncidents: hateSum._sum.incidents ?? 0,
        violentRate: violentSum._sum.violentRate ?? 0,
        propertyRate: propertySum._sum.propertyRate ?? 0,
      },
      lastUpdated: {
        hateCrimes: hateMax._max.updatedAt,
        crimeStats: crimeMax._max.updatedAt,
        demographics: demoMax._max.updatedAt,
      },
      citations,
    }

    const fingerprint = crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex')
      .slice(0, 12)

    res.json({ ...payload, fingerprint, generatedAt: new Date().toISOString() })
  } catch (e: any) {
    console.error(JSON.stringify({ level: 'error', msg: 'admin_dataset_failed', err: String(e?.message || e) }))
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Location detail
app.get('/api/locations/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid id' })
    const loc = await prisma.location.findUnique({ where: { id } })
    if (!loc) return res.status(404).json({ error: 'not found' })

    const [hateCrimes, crimeStats, demographics] = await Promise.all([
      prisma.hateCrime.findMany({ where: { locationId: id }, select: { biasType: true, incidents: true } }),
      prisma.crimeStats.findUnique({ where: { locationId: id }, select: { violentRate: true, propertyRate: true } }),
      prisma.demographics.findUnique({ where: { locationId: id }, select: { diversity: true } }),
    ])

    const { score, breakdown, subScores, citations } = computeTruePlaceScore(loc, {})
    res.json({
      id: loc.id,
      name: loc.name,
      state: loc.state,
      score,
      breakdown,
      subScores,
      citations,
      stats: {
        hateCrimes: { byBias: hateCrimes },
        crimeStats,
        demographics,
      },
    })
  } catch (e: any) {
    console.error(JSON.stringify({ level: 'error', msg: 'location_detail_failed', err: String(e?.message || e) }))
    res.status(500).json({ error: 'Internal server error' })
  }
})

if (!process.env.VITEST_WORKER_ID) {
  app.listen(port, () => {
    const log = { ts: new Date().toISOString(), level: 'info', msg: 'listening', url: `http://localhost:${port}` }
    console.log(JSON.stringify(log));
  });
}

export default app


