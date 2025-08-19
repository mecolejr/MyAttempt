import React, { useEffect, useState } from 'react'
import MapView from './MapView'
import ScoreBars from './components/ScoreBars'
import Citations from './components/Citations'
import Toast from './components/Toast'
import LocationDetail from './components/LocationDetail'
import AdminPanel from './components/AdminPanel'
import { fetchApi } from './utils/fetchApi'

export default function App() {
  const [location, setLocation] = useState('Texas')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [locations, setLocations] = useState<{ id: number; name: string; state: string }[]>([])
  const [valuesDiversity, setValuesDiversity] = useState(false)
  const [ranked, setRanked] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [stateFilter, setStateFilter] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; variant?: 'error'|'success' } | null>(null)
  const [cacheMeta, setCacheMeta] = useState<{ hit: boolean; key: string; ttlMs: number } | null>(null)
  const [forceRefresh, setForceRefresh] = useState(false)
  const [minSafety, setMinSafety] = useState<number | ''>('')
  const [minCommunity, setMinCommunity] = useState<number | ''>('')
  const [limit, setLimit] = useState<number>(10)
  const [sortBy, setSortBy] = useState<'score' | 'safety' | 'community'>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [offset, setOffset] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [biasTypes, setBiasTypes] = useState<string[]>([])
  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('tp_favorites') || '[]') } catch { return [] }
  })
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false)
  const [query, setQuery] = useState<string>('')
  const [showAbout, setShowAbout] = useState<boolean>(false)
  const [authToken, setAuthToken] = useState<string>(() => {
    try { return localStorage.getItem('tp_auth_token') || '' } catch { return '' }
  })
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    fetchApi('/api/locations')
      .then((r) => r.json())
      .then((data) => {
        const list = data.locations || []
        setLocations(list)
        try {
          const savedLoc = localStorage.getItem('tp_location')
          const preferred = list.find((l: any) => l.name === savedLoc)
          if (preferred) {
            setLocation(preferred.name)
            return
          }
        } catch {}
        if (list.length > 0 && !list.find((l: any) => l.name === location)) setLocation(list[0].name)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tp_valuesDiversity')
      if (saved === 'true' || saved === 'false') setValuesDiversity(saved === 'true')
    } catch {}
  }, [])

  useEffect(() => {
    // Load profile from server if signed in
    const load = async () => {
      if (!authToken) return
      try {
        const res = await fetchApi('/api/profile')
        const data = await res.json()
        if (res.ok && data?.data) {
          const d = data.data
          if (typeof d.valuesDiversity === 'boolean') setValuesDiversity(d.valuesDiversity)
          if (typeof d.minSafety === 'number' || d.minSafety === '') setMinSafety(d.minSafety)
          if (typeof d.minCommunity === 'number' || d.minCommunity === '') setMinCommunity(d.minCommunity)
          if (typeof d.sortBy === 'string') setSortBy(d.sortBy)
          if (typeof d.sortDir === 'string') setSortDir(d.sortDir)
          if (typeof d.limit === 'number') setLimit(d.limit)
          if (Array.isArray(d.biasTypes)) setBiasTypes(d.biasTypes)
          if (typeof d.stateFilter === 'string') setStateFilter(d.stateFilter)
          if (typeof d.query === 'string') setQuery(d.query)
        }
      } catch {}
    }
    load()
  }, [authToken])

  useEffect(() => {
    // URL -> state (takes precedence over localStorage)
    try {
      const url = new URL(window.location.href)
      const p = url.searchParams
      if (p.has('location')) setLocation(p.get('location') || 'Texas')
      if (p.has('valuesDiversity')) setValuesDiversity(p.get('valuesDiversity') === 'true')
      if (p.has('minSafety')) setMinSafety(Number(p.get('minSafety') || ''))
      if (p.has('minCommunity')) setMinCommunity(Number(p.get('minCommunity') || ''))
      if (p.has('limit')) setLimit(Number(p.get('limit') || 10))
      if (p.has('offset')) setOffset(Number(p.get('offset') || 0))
      if (p.has('sortBy')) setSortBy(p.get('sortBy') as any)
      if (p.has('sortDir')) setSortDir(p.get('sortDir') as any)
      if (p.has('state')) setStateFilter(p.get('state') || '')
      const bias = p.getAll('biasType')
      if (bias && bias.length > 0) setBiasTypes(Array.from(new Set(bias)))
      if (p.has('q')) setQuery(p.get('q') || '')
      if (p.has('fav')) setFavoritesOnly(p.get('fav') === '1')
    } catch {}

    // Load persisted UI settings
    try {
      const cfg = JSON.parse(localStorage.getItem('tp_ui') || '{}')
      if (cfg.minSafety !== undefined) setMinSafety(cfg.minSafety)
      if (cfg.minCommunity !== undefined) setMinCommunity(cfg.minCommunity)
      if (cfg.limit) setLimit(cfg.limit)
      if (cfg.sortBy) setSortBy(cfg.sortBy)
      if (cfg.sortDir) setSortDir(cfg.sortDir)
    } catch {}
  }, [])

  useEffect(() => {
    // Persist settings
    try {
      localStorage.setItem('tp_ui', JSON.stringify({ minSafety, minCommunity, limit, sortBy, sortDir }))
    } catch {}
  }, [minSafety, minCommunity, limit, sortBy, sortDir])

  useEffect(() => {
    // Hydrate favorites from server if signed in
    const load = async () => {
      if (!authToken) return
      try {
        const res = await fetchApi('/api/favorites')
        const data = await res.json()
        if (res.ok && Array.isArray(data.favorites)) setFavorites(data.favorites)
      } catch {}
    }
    load()
  }, [authToken])

  // Sync state -> URL (shareable links)
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const p = url.searchParams
      p.set('location', location)
      p.set('valuesDiversity', String(valuesDiversity))
      if (minSafety !== '') p.set('minSafety', String(minSafety)); else p.delete('minSafety')
      if (minCommunity !== '') p.set('minCommunity', String(minCommunity)); else p.delete('minCommunity')
      p.set('limit', String(limit))
      p.set('offset', String(offset))
      p.set('sortBy', sortBy)
      p.set('sortDir', sortDir)
      // Replace biasType params
      p.delete('biasType')
      for (const b of biasTypes) p.append('biasType', b)
      if (stateFilter) p.set('state', stateFilter); else p.delete('state')
      if (query) p.set('q', query); else p.delete('q')
      if (favoritesOnly) p.set('fav', '1'); else p.delete('fav')
      const next = `${url.pathname}?${p.toString()}`
      window.history.replaceState(null, '', next)
    } catch {}
  }, [location, valuesDiversity, minSafety, minCommunity, limit, offset, sortBy, sortDir, biasTypes, stateFilter, query, favoritesOnly])

  useEffect(() => {
    const controller = new AbortController()
    const loadRanked = async () => {
      try {
        const params = new URLSearchParams({ valuesDiversity: String(valuesDiversity), limit: String(limit), sortBy, sortDir, offset: String(offset) })
        if (minSafety !== '') params.set('minSafety', String(minSafety))
        if (minCommunity !== '') params.set('minCommunity', String(minCommunity))
        for (const b of biasTypes) params.append('biasType', b)
        if (stateFilter) params.set('state', stateFilter)
        if (query) params.set('q', query)
        const res = await fetchApi(`/api/profile-scores?${params.toString()}`, { signal: controller.signal })
        const data = await res.json()
        if (res.ok) {
          setRanked(Array.isArray(data.results) ? data.results : [])
          if (typeof data.total === 'number') setTotal(data.total)
          if (data.cache) setCacheMeta(data.cache)
        }
      } catch {}
    }
    loadRanked()
    return () => controller.abort()
  }, [valuesDiversity, minSafety, minCommunity, limit, sortBy, sortDir, offset, biasTypes])

  useEffect(() => {
    try {
      localStorage.setItem('tp_valuesDiversity', String(valuesDiversity))
    } catch {}
  }, [valuesDiversity])

  useEffect(() => {
    try { localStorage.setItem('tp_favorites', JSON.stringify(favorites)) } catch {}
  }, [favorites])

  function toggleFavorite(id: number) {
    setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const filteredRanked = ranked
    .filter((r) => (stateFilter ? r.state === stateFilter : true))
    .filter((r) => (favoritesOnly ? favorites.includes(r.id) : true))
    .filter((r) => (query ? (`${r.name}, ${r.state}`.toLowerCase().includes(query.toLowerCase())) : true))

  function exportCsv() {
    const headers = ['name','state','score','safety','community','policy']
    const rows = filteredRanked.map((r) => [
      r.name,
      r.state,
      String(r.score ?? ''),
      String(r.subScores?.safety ?? ''),
      String(r.subScores?.community ?? ''),
      String((r.subScores as any)?.policy ?? ''),
    ])
    const csv = [headers, ...rows].map((arr) => arr.map((v) => String(v).replace(/"/g,'""')).map((v)=>/[,"\n]/.test(v)?`"${v}"`:v).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trueplace-ranked.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setRanked([])
    try {
      setLoading(true)
      const params = new URLSearchParams({ location, valuesDiversity: String(valuesDiversity) })
      const rankedParams = new URLSearchParams({ valuesDiversity: String(valuesDiversity), limit: String(limit), sortBy, sortDir, offset: String(offset) })
      if (minSafety !== '') rankedParams.set('minSafety', String(minSafety))
      if (minCommunity !== '') rankedParams.set('minCommunity', String(minCommunity))
      if (forceRefresh) rankedParams.set('nocache', 'true')
      for (const b of biasTypes) rankedParams.append('biasType', b)
      if (stateFilter) rankedParams.set('state', stateFilter)
      if (query) rankedParams.set('q', query)
      const [r1, r2] = await Promise.all([
        fetchApi(`/api/score?${params.toString()}`),
        fetchApi(`/api/profile-scores?${rankedParams.toString()}`)
      ])
      const t1 = await r1.text()
      const t2 = await r2.text()
      if (!r1.ok) throw new Error(t1 || 'Request failed')
      if (!r2.ok) throw new Error(t2 || 'Request failed')
      const data1 = t1 ? JSON.parse(t1) : {}
      const data2 = t2 ? JSON.parse(t2) : {}
      setResult(data1)
      setRanked(Array.isArray(data2.results) ? data2.results.slice(0, 10) : [])
      if (data2.cache) setCacheMeta(data2.cache)
    } catch (err: any) {
      const msg = err.message || 'Unknown error'
      setError(msg)
      setToast({ message: msg, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="compact" style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <a href="#main" style={{ position: 'absolute', left: -9999, top: -9999 }} onFocus={(e)=>{ (e.currentTarget.style.position='static') }}>Skip to content</a>
      <header style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h1 style={{ marginRight: 'auto' }}>TruePlace</h1>
        <button className="btn" type="button" onClick={() => {
          const root = document.documentElement
          const isDark = root.getAttribute('data-theme') === 'dark'
          if (isDark) root.removeAttribute('data-theme')
          else root.setAttribute('data-theme', 'dark')
        }}>
          Toggle theme
        </button>
      </header>
      <main id="main">
      <form onSubmit={handleSubmit} className="toolbar">
        {locations.length > 0 ? (
          <select className="select"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value)
              try { localStorage.setItem('tp_location', e.target.value) } catch {}
            }}
          >
            {locations.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        ) : (
          <input className="input"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value)
              try { localStorage.setItem('tp_location', e.target.value) } catch {}
            }}
            placeholder="Enter a location name"
          />
        )}
        <label style={{ display: 'flex', gap: 6 }}>
          <input className="checkbox" type="checkbox" checked={valuesDiversity} onChange={(e) => setValuesDiversity(e.target.checked)} />
          Value diversity
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Loading…' : 'Show My Score'}</button>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 8 }} title="Bypass cached results">
          <input className="checkbox" type="checkbox" checked={forceRefresh} onChange={(e) => setForceRefresh(e.target.checked)} />
          Force refresh
        </label>
        <button className="btn" type="button" onClick={() => setShowAdmin(true)} style={{ marginLeft: 8 }}>Admin</button>
        <button className="btn" type="button" onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href)
            setToast({ message: 'Link copied', variant: 'success' })
          } catch {
            const ta = document.createElement('textarea');
            ta.value = window.location.href; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
            setToast({ message: 'Link copied', variant: 'success' })
          }
        }}>Copy link</button>
      </form>
      <div className="toolbar" style={{ marginTop: 8 }}>
        <label>Min safety: <input className="input" style={{ width: 80 }} type="number" min={0} max={100} value={minSafety} onChange={(e) => setMinSafety(e.target.value === '' ? '' : Number(e.target.value))} /></label>
        <label>Min community: <input className="input" style={{ width: 80 }} type="number" min={0} max={100} value={minCommunity} onChange={(e) => setMinCommunity(e.target.value === '' ? '' : Number(e.target.value))} /></label>
        <label>Sort by: <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}><option value="score">Score</option><option value="safety">Safety</option><option value="community">Community</option></select></label>
        <label>Dir: <select className="select" value={sortDir} onChange={(e) => setSortDir(e.target.value as any)}><option value="desc">desc</option><option value="asc">asc</option></select></label>
        <label>Incident category filter:
          <select className="select" multiple value={biasTypes} onChange={(e) => { const arr = Array.from(e.target.selectedOptions).map(o => o.value); setBiasTypes(arr); setOffset(0) }}>
            <option value="anti-LGBTQ">Against LGBTQ people</option>
            <option value="anti-Asian">Against Asian people</option>
            <option value="anti-Black">Against Black people</option>
          </select>
        </label>
        <label>Search: <input className="input" value={query} onChange={(e) => { setQuery(e.target.value); setOffset(0) }} placeholder="e.g., Texas" /></label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input className="checkbox" type="checkbox" checked={favoritesOnly} onChange={(e) => { setFavoritesOnly(e.target.checked); setOffset(0) }} />
          Favorites only
        </label>
        <button className="btn" type="button" onClick={() => {
          setMinSafety('')
          setMinCommunity('')
          setSortBy('score')
          setSortDir('desc')
          setLimit(10)
          setOffset(0)
          setBiasTypes([])
          setStateFilter('')
          setQuery('')
          setFavoritesOnly(false)
          setToast({ message: 'Filters reset', variant: 'success' })
        }}>Reset filters</button>
        <button className="btn" type="button" onClick={exportCsv}>Export CSV</button>
        <button className="btn" type="button" onClick={() => {
          try {
            const json = JSON.stringify(filteredRanked, null, 2)
            const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'trueplace-ranked.json'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          } catch {}
        }}>Export JSON</button>
        <button className="btn" type="button" onClick={() => setShowAbout(true)}>About scoring</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          {authToken ? (
            <>
              <span style={{ fontSize: 12, opacity: 0.8 }}>Signed in</span>
              <button className="btn" onClick={() => { setAuthToken(''); try { localStorage.removeItem('tp_auth_token') } catch {}; setToast({ message: 'Signed out', variant: 'success' }) }}>Sign out</button>
            </>
          ) : (
            <>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email (dev)" style={{ width: 220 }} />
              <button className="btn btn-primary" onClick={async () => {
                try {
                  const res = await fetchApi('/api/auth/dev-login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
                  const data = await res.json()
                  if (!res.ok) throw new Error(data?.error || 'Failed to sign in')
                  setAuthToken(data.token)
                  try { localStorage.setItem('tp_auth_token', data.token) } catch {}
                  setToast({ message: 'Signed in', variant: 'success' })
                  // hydrate favorites
                  try {
                    const r = await fetchApi('/api/favorites')
                    const j = await r.json()
                    if (r.ok && Array.isArray(j.favorites)) setFavorites(j.favorites)
                  } catch {}
                  // load profile
                  try {
                    const r2 = await fetchApi('/api/profile')
                    const j2 = await r2.json()
                    if (r2.ok && j2?.data) {
                      const d = j2.data
                      if (typeof d.valuesDiversity === 'boolean') setValuesDiversity(d.valuesDiversity)
                      if (typeof d.minSafety === 'number' || d.minSafety === '') setMinSafety(d.minSafety)
                      if (typeof d.minCommunity === 'number' || d.minCommunity === '') setMinCommunity(d.minCommunity)
                      if (typeof d.sortBy === 'string') setSortBy(d.sortBy)
                      if (typeof d.sortDir === 'string') setSortDir(d.sortDir)
                      if (typeof d.limit === 'number') setLimit(d.limit)
                      if (Array.isArray(d.biasTypes)) setBiasTypes(d.biasTypes)
                      if (typeof d.stateFilter === 'string') setStateFilter(d.stateFilter)
                      if (typeof d.query === 'string') setQuery(d.query)
                    }
                  } catch {}
                } catch (e: any) {
                  setToast({ message: e.message || 'Sign-in failed', variant: 'error' })
                }
              }}>Sign in</button>
            </>
          )}
        </div>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}
      {result && (
        <div style={{ marginTop: 16 }}>
          <h2>
            {result.location}, {result.state}
          </h2>
          <p>TruePlace Score: {result.score}/100</p>
          <ScoreBars hateCrimeIndex={result.breakdown.hateCrimeIndex} diversityIndex={result.breakdown.diversityIndex} />
          {result.subScores && (
            <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
              <span><strong>Safety:</strong> {result.subScores.safety}%</span>
              <span><strong>Community:</strong> {result.subScores.community}%</span>
            </div>
          )}
          {Array.isArray(result.citations) && result.citations.length > 0 && <Citations items={result.citations} />}
        </div>
      )}
      {loading && (
        <div style={{ marginTop: 16 }}>
          <h3>Top matches</h3>
          <ol>
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <div style={{ height: 14, width: 240, background: '#eee', borderRadius: 4 }} />
              </li>
            ))}
          </ol>
        </div>
      )}
      {(!loading && ranked.length > 0) && (
        <div style={{ marginTop: 24 }}>
          <h3>Top matches</h3>
          {cacheMeta && (
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
              Cache: {cacheMeta.hit ? 'hit' : 'miss'} · key {cacheMeta.key}
            </div>
          )}
          <div style={{ marginBottom: 8 }}>
            <label>
              Filter by state:
              <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} style={{ marginLeft: 8 }}>
                <option value="">All</option>
                {[...new Set(locations.map((l) => l.state))].map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </label>
          </div>
          <ol>
            {filteredRanked.map((r) => (
              <li key={r.id} style={{ marginBottom: 8 }}>
                <div>
                  <button
                    title={favorites.includes(r.id) ? 'Remove favorite' : 'Add favorite'}
                    onClick={async () => {
                      toggleFavorite(r.id)
                      if (authToken) {
                        try {
                          if (favorites.includes(r.id)) {
                            await fetchApi(`/api/favorites/${r.id}`, { method: 'DELETE' })
                          } else {
                            await fetchApi('/api/favorites', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ locationId: r.id }) })
                          }
                        } catch {}
                      }
                    }}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginRight: 6 }}
                    aria-label="Toggle favorite"
                  >{favorites.includes(r.id) ? '★' : '☆'}</button>
                  {r.name}, {r.state} — {r.score}/100
                </div>
                {'breakdown' in r && r.breakdown && (
                  <ScoreBars hateCrimeIndex={r.breakdown.hateCrimeIndex} diversityIndex={r.breakdown.diversityIndex} />
                )}
                {r.subScores && (
                  <div style={{ marginTop: 4, display: 'flex', gap: 16, fontSize: 12 }}>
                    <span>Safety: {r.subScores.safety}%</span>
                    <span>Community: {r.subScores.community}%</span>
                  </div>
                )}
                {Array.isArray(r.citations) && r.citations.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <Citations items={r.citations} />
                  </div>
                )}
                <div style={{ marginTop: 6 }}>
                  <button className="btn" onClick={() => setDetailId(r.id)}>View details</button>
                </div>
              </li>
            ))}
          </ol>
          <div className="toolbar" style={{ marginTop: 8 }}>
            <button className="btn" disabled={offset <= 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Previous</button>
            <button className="btn" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>Next</button>
            <span style={{ fontSize: 12, opacity: 0.8 }}>
              Showing {Math.min(total, offset + 1)}–{Math.min(total, offset + ranked.length)} of {total}
            </span>
            <label>Page size: <select className="select" value={limit} onChange={(e) => { setOffset(0); setLimit(Number(e.target.value)) }}>
              {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
            </select></label>
            {authToken && (
              <button className="btn btn-primary" onClick={async () => {
                try {
                  const payload = { valuesDiversity, minSafety, minCommunity, limit, sortBy, sortDir, biasTypes, stateFilter, query }
                  const res = await fetchApi('/api/profile', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: payload }) })
                  if (res.ok) setToast({ message: 'Preferences saved', variant: 'success' })
                } catch {}
              }}>Save preferences</button>
            )}
          </div>
        </div>
      )}
      {(!loading && ranked.length === 0) && (
        <div style={{ marginTop: 24, opacity: 0.8 }}>
          <em>No matches. Try relaxing filters or selecting different bias types.</em>
        </div>
      )}
      {detailId != null && <LocationDetail id={detailId} onClose={() => setDetailId(null)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showAbout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }} onClick={() => setShowAbout(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 16, width: 440, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>About scoring</h3>
              <button onClick={() => setShowAbout(false)} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>
              <p>TruePlace combines sub-scores to form a 0–100 score:</p>
              <ul>
                <li>Safety (lower incidents, lower crime)</li>
                <li>Community (diversity)</li>
                <li>Policy (local protections, currently stubbed)</li>
              </ul>
              <p>Weights default to Community 45% (60% if you value diversity), Safety 25–40%, Policy 15%.</p>
              <p>Sources are cited per result (FBI Crime Data, U.S. Census ACS). We will refine these over time.</p>
            </div>
          </div>
        </div>
      )}
      <MapView valuesDiversity={valuesDiversity} onSelectLocation={(p) => {
        if (p && p.state) {
          setStateFilter(p.state)
          const found = locations.find(l => l.state === p.state || l.name === p.name)
          if (found) {
            setLocation(found.name)
            setDetailId(found.id)
          }
        } else {
          setStateFilter('')
        }
      }} />
      </main>
    </div>
  )
}


