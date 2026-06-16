"use client"
import React, { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import type {
  Champion,
  ChampionTier,
  Build,
  Skin,
  Ability,
  HomePageProps,
} from '../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Fighter:   { bg: '#3d1a1a', text: '#ff6b6b', border: '#ff6b6b' },
  Tank:      { bg: '#1a2a3d', text: '#4dabf7', border: '#4dabf7' },
  Mage:      { bg: '#2a1a3d', text: '#cc5de8', border: '#cc5de8' },
  Assassin:  { bg: '#1a1a2a', text: '#d0d6e0', border: '#555e6b' },
  Support:   { bg: '#1a3d2a', text: '#51cf66', border: '#51cf66' },
  Marksman:  { bg: '#3d2e1a', text: '#ffd43b', border: '#ffd43b' },
}

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  S: { bg: '#ffd700', text: '#1a1a1a' },
  A: { bg: '#c0392b', text: '#fff' },
  B: { bg: '#27ae60', text: '#fff' },
  C: { bg: '#2980b9', text: '#fff' },
  D: { bg: '#7f8c8d', text: '#fff' },
}

const ALL_ROLES = ['All', 'Fighter', 'Tank', 'Mage', 'Assassin', 'Support', 'Marksman']
const ALL_TIERS = ['All', 'S', 'A', 'B', 'C', 'D']

type SortOption = 'name' | 'tier' | 'winrate'
type ActiveTab = 'overview' | 'tiers' | 'abilities' | 'build' | 'skins'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTierBestForChamp(
  championId: string,
  map: Record<string, Record<string, ChampionTier>>
): ChampionTier['tier'] | null {
  const tierOrder: ChampionTier['tier'][] = ['S', 'A', 'B', 'C', 'D']
  const champTiers = map[championId]
  if (!champTiers) return null
  for (const t of tierOrder) {
    if (Object.values(champTiers).some((ct) => ct.tier === t)) return t
  }
  return null
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function ChampionWiki({
  champions,
  tiers,
  builds,
  skins,
  abilities,
}: HomePageProps) {
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('All')
  const [filterTier, setFilterTier] = useState('All')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  const championTierMap = useMemo(() => {
    const map: Record<string, Record<string, ChampionTier>> = {}
    tiers.forEach((t) => {
      if (!map[t.championId]) map[t.championId] = {}
      map[t.championId][t.role] = t
    })
    return map
  }, [tiers])

  const getBestTier = useCallback(
    (championId: string) => getTierBestForChamp(championId, championTierMap),
    [championTierMap]
  )

  const filteredChampions = useMemo(() => {
    let list = [...champions]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
      )
    }
    if (filterRole !== 'All') list = list.filter((c) => c.tags?.includes(filterRole))
    if (filterTier !== 'All') list = list.filter((c) => getBestTier(c.id) === filterTier)

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'winrate') {
        const avg = (id: string) => {
          const ct = championTierMap[id]
          if (!ct) return 0
          const vals = Object.values(ct)
          return vals.reduce((s, t) => s + t.stats.winRate, 0) / vals.length
        }
        return avg(b.id) - avg(a.id)
      }
      if (sortBy === 'tier') {
        const order: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 }
        return (order[getBestTier(a.id) ?? ''] ?? 5) - (order[getBestTier(b.id) ?? ''] ?? 5)
      }
      return 0
    })
    return list
  }, [champions, searchQuery, filterRole, filterTier, sortBy, championTierMap, getBestTier])

  const openChampion = (champ: Champion) => {
    setSelectedChampion(champ)
    setActiveTab('overview')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const goBack = () => setSelectedChampion(null)

  return (
    <div className="ward-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0a0a0f 0%,#0d1117 50%,#0a0d14 100%)',
      color: '#e8eaed',
    }}>
      <style>{`
        .champ-card{transition:transform .2s,box-shadow .2s;cursor:pointer}
        .champ-card:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 8px 32px rgba(200,160,50,.28)!important}
        .tab-btn{transition:all .2s;cursor:pointer;border:none;background:transparent}
        .tab-btn:hover{background:rgba(255,255,255,.05)!important}
        .filter-btn{transition:all .15s;cursor:pointer;border:none}
        .filter-btn:hover{opacity:.82}
        .stat-bar-fill{transition:width .8s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn .28s ease}
        @keyframes shimmer{0%,100%{opacity:.45}50%{opacity:.9}}
        .shimmer{animation:shimmer 1.4s infinite}

        /* ── Responsive header ── */
        .ward-header {
          border-bottom: 1px solid rgba(200,160,50,.3);
          padding: 0 16px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(10,10,15,.96);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        @media(min-width:640px){
          .ward-header { padding: 0 24px; height: 64px; }
        }

        .ward-header-nav {
          display: none;
          gap: 8px;
          align-items: center;
        }
        @media(min-width:640px){
          .ward-header-nav { display: flex; }
        }

        .ward-mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: 1px solid rgba(200,160,50,.25);
          border-radius: 6px;
          color: #c8a032;
          padding: 6px 10px;
          font-size: 18px;
          cursor: pointer;
        }
        @media(min-width:640px){
          .ward-mobile-menu-btn { display: none; }
        }

        /* Mobile nav drawer */
        .ward-mobile-drawer {
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          background: rgba(10,10,15,.98);
          border-bottom: 1px solid rgba(200,160,50,.3);
          padding: 12px 16px 16px;
          z-index: 99;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transform: translateY(-110%);
          transition: transform .2s ease;
        }
        .ward-mobile-drawer.open { transform: translateY(0); }
        @media(min-width:640px){
          .ward-mobile-drawer { display: none !important; }
        }

        /* ── Champion cards grid ── */
        .champ-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding-bottom: 48px;
        }
        @media(min-width:480px){
          .champ-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media(min-width:768px){
          .champ-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
        }

        /* ── Hero title ── */
        .hero-title {
          font-size: 36px;
          font-weight: 700;
          color: #c8a032;
          letter-spacing: 4px;
          line-height: 1;
        }
        @media(min-width:640px){ .hero-title { font-size: 52px; letter-spacing: 5px; } }

        /* ── Filters bar ── */
        .filters-wrap {
          background: rgba(13,17,23,.9);
          border: 1px solid rgba(200,160,50,.2);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .sort-row {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
        }
        @media(min-width:768px){
          .sort-row { margin-left: auto; }
        }

        /* ── Detail hero splash ── */
        .detail-hero {
          position: relative;
          height: 200px;
          overflow: hidden;
          border-radius: 0 0 16px 16px;
          margin-bottom: 20px;
        }
        @media(min-width:480px){ .detail-hero { height: 260px; } }
        @media(min-width:768px){ .detail-hero { height: 380px; margin-bottom: 24px; } }

        .detail-hero-info {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0 16px 16px;
        }
        @media(min-width:640px){ .detail-hero-info { padding: 0 32px 28px; } }

        .detail-champ-name {
          font-size: 28px;
          font-weight: 700;
          color: #e8eaed;
          letter-spacing: 2px;
          line-height: 1;
        }
        @media(min-width:480px){ .detail-champ-name { font-size: 36px; letter-spacing: 3px; } }
        @media(min-width:768px){ .detail-champ-name { font-size: 46px; letter-spacing: 3px; } }

        .detail-avatar {
          width: 56px !important;
          height: 56px !important;
        }
        @media(min-width:480px){
          .detail-avatar { width: 70px !important; height: 70px !important; }
        }
        @media(min-width:768px){
          .detail-avatar { width: 80px !important; height: 80px !important; }
        }

        /* ── Overview grid ── */
        .overview-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          padding-bottom: 48px;
        }
        @media(min-width:640px){
          .overview-grid { grid-template-columns: 1fr 1fr; gap: 20px; }
        }

        .overview-lore {
          grid-column: 1 / -1;
        }

        /* ── Build grid ── */
        .build-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          padding-bottom: 48px;
        }
        @media(min-width:640px){
          .build-grid { grid-template-columns: 1fr 1fr; gap: 20px; }
        }

        /* ── Skins grid ── */
        .skins-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          padding-bottom: 48px;
        }
        @media(min-width:640px){
          .skins-grid { grid-template-columns: 2fr 1fr; gap: 20px; }
        }

        .skins-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: none;
          overflow-y: visible;
        }
        @media(min-width:640px){
          .skins-list { max-height: 520px; overflow-y: auto; }
        }

        /* ── Abilities detail ── */
        .ability-detail {
          background: rgba(13,17,23,.9);
          border: 1px solid rgba(200,160,50,.2);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }
        @media(min-width:640px){
          .ability-detail { padding: 24px; flex-direction: row; gap: 20px; }
        }

        /* ── Patch notes layout ── */
        .patch-layout {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media(min-width:768px){
          .patch-layout { padding: 24px 20px; grid-template-columns: 220px 1fr; gap: 24px; }
        }
        @media(min-width:1024px){
          .patch-layout { grid-template-columns: 240px 1fr; }
        }

        .patch-sidebar {
          display: none;
        }
        @media(min-width:768px){
          .patch-sidebar { display: block; }
        }

        .patch-version-select {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        @media(min-width:768px){
          .patch-version-select { display: none; }
        }

        /* ── Patch stats bar ── */
        .patch-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }
        @media(min-width:480px){
          .patch-stats { grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
        }

        .patch-hero {
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
          position: relative;
          height: 140px;
          background: #1a1a2a;
        }
        @media(min-width:480px){ .patch-hero { height: 180px; } }
        @media(min-width:768px){ .patch-hero { height: 200px; margin-bottom: 24px; } }

        .patch-hero-title {
          font-size: 22px;
          font-weight: 700;
          color: #c8a032;
          letter-spacing: 2px;
        }
        @media(min-width:480px){ .patch-hero-title { font-size: 30px; letter-spacing: 3px; } }
        @media(min-width:768px){ .patch-hero-title { font-size: 36px; } }

        /* ── Profile layout ── */
        .profile-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px 16px;
        }
        @media(min-width:640px){ .profile-content { padding: 32px 20px; } }

        .profile-header-card {
          background: rgba(13,17,23,.9);
          border: 1px solid rgba(200,160,50,.2);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }
        @media(min-width:640px){
          .profile-header-card {
            flex-direction: row;
            padding: 28px;
            align-items: center;
            flex-wrap: wrap;
            gap: 24px;
            margin-bottom: 24px;
          }
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media(min-width:640px){
          .profile-grid { grid-template-columns: 1fr 1fr; gap: 20px; }
        }

        .profile-favorites {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media(min-width:480px){
          .profile-favorites { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }

        /* ── Summoner spells ── */
        .spells-title {
          font-size: 32px;
        }
        @media(min-width:640px){ .spells-title { font-size: 42px; } }
      `}</style>

      {/* ── Header ── */}
      <header className="ward-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {selectedChampion && (
            <button onClick={goBack} style={{
              background: 'none', border: 'none', color: '#c8a032', cursor: 'pointer',
              fontSize: 20, padding: '4px 6px', borderRadius: 6,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              ← <span style={{ fontSize: 13, color: '#9aa3af' }}>Back</span>
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#c8a032', letterSpacing: 2, lineHeight: 1 }}>
                WARD
              </div>
              <div style={{ fontSize: 9, color: '#6e7681', letterSpacing: 3, textTransform: 'uppercase' }}>
                LOL WIKI
              </div>
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="ward-header-nav">
          <span style={{ fontSize: 13, color: '#6e7681' }}>{champions.length} champions</span>
          <div style={{ width: 1, height: 20, background: '#21262d' }} />
          <Link href="/patch-notes" style={{
            fontSize: 13, color: '#9aa3af',
            padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(200,160,50,.25)',
          }}>
            📋 Patch Notes
          </Link>
          {status === 'authenticated' ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileMenuOpen((o) => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13, color: '#9aa3af',
                  padding: '4px 12px 4px 4px', borderRadius: 20,
                  border: '1px solid rgba(200,160,50,.25)', background: 'none', cursor: 'pointer',
                }}
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? 'Perfil'}
                    style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'rgba(200,160,50,.2)', color: '#c8a032',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {(session?.user?.name ?? '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{session?.user?.name ?? 'Usuario'}</span>
              </button>

              {profileMenuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'rgba(13,17,23,.98)', border: '1px solid rgba(200,160,50,.25)',
                  borderRadius: 10, padding: '14px 18px', minWidth: 160,
                  boxShadow: '0 8px 24px rgba(0,0,0,.4)', zIndex: 200,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#e8eaed' }}>
                    {session?.user?.name ?? 'Usuario'}
                  </span>
                </div>
              )}
            </div>
          ) : null}

          {status === 'authenticated' ? (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                fontSize: 13, color: '#9aa3af', padding: '6px 12px', borderRadius: 6,
                border: '1px solid rgba(200,160,50,.25)', background: 'none', cursor: 'pointer',
              }}
            >
              🚪 Log Out
            </button>
          ) : (
            <Link href="/login" style={{
              fontSize: 13, color: '#9aa3af',
              padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(200,160,50,.25)',
            }}>
              🔑 Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="ward-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile drawer */}
      <nav className={`ward-mobile-drawer${mobileMenuOpen ? ' open' : ''}`}>
        <Link href="/patch-notes" style={{
          fontSize: 14, color: '#9aa3af',
          padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(200,160,50,.2)',
          display: 'block',
        }} onClick={() => setMobileMenuOpen(false)}>
          📋 Patch Notes
        </Link>
        {status === 'authenticated' ? (
          <>
            <button
              onClick={() => setProfileMenuOpen((o) => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 14, color: '#9aa3af',
                padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(200,160,50,.2)',
                background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? 'Perfil'}
                  style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(200,160,50,.2)', color: '#c8a032',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {(session?.user?.name ?? '?').charAt(0).toUpperCase()}
                </div>
              )}
              <span>{session?.user?.name ?? 'Usuario'}</span>
            </button>

            {profileMenuOpen && (
              <div style={{
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(200,160,50,.2)',
                borderRadius: 8, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e8eaed' }}>
                  {session?.user?.name ?? 'Usuario'}
                </span>
              </div>
            )}

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                fontSize: 14, color: '#9aa3af', padding: '10px 14px', borderRadius: 8,
                border: '1px solid rgba(200,160,50,.2)', background: 'none', cursor: 'pointer',
                textAlign: 'left', width: '100%',
              }}
            >
              🚪 log out
            </button>
          </>
        ) : (
          <Link href="/login" style={{
            fontSize: 14, color: '#9aa3af',
            padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(200,160,50,.2)',
            display: 'block',
          }} onClick={() => setMobileMenuOpen(false)}>
            🔑 Sign In
          </Link>
        )}
        <div style={{ fontSize: 12, color: '#6e7681', paddingLeft: 4 }}>{champions.length} champions available</div>
      </nav>

      <div className="ward-container">
        {!selectedChampion ? (
          <GridView
            champions={filteredChampions}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            filterTier={filterTier}
            setFilterTier={setFilterTier}
            sortBy={sortBy}
            setSortBy={setSortBy}
            getBestTier={getBestTier}
            championTierMap={championTierMap}
            onSelect={openChampion}
          />
        ) : (
          <DetailView
            champion={selectedChampion}
            tiers={championTierMap[selectedChampion.id] ?? {}}
            build={builds.find((b) => b.id === selectedChampion.id) ?? null}
            skins={skins.filter((s) => s.championId === selectedChampion.id)}
            abilities={abilities.filter((a) => a.champion_id === selectedChampion.id)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
    </div>
  )
}

// ─── Grid View ────────────────────────────────────────────────────────────────

interface GridViewProps {
  champions: Champion[]
  searchQuery: string
  setSearchQuery: (v: string) => void
  filterRole: string
  setFilterRole: (v: string) => void
  filterTier: string
  setFilterTier: (v: string) => void
  sortBy: SortOption
  setSortBy: (v: SortOption) => void
  getBestTier: (id: string) => ChampionTier['tier'] | null
  championTierMap: Record<string, Record<string, ChampionTier>>
  onSelect: (c: Champion) => void
}

function GridView({
  champions, searchQuery, setSearchQuery, filterRole, setFilterRole,
  filterTier, setFilterTier, sortBy, setSortBy, getBestTier, championTierMap, onSelect,
}: GridViewProps) {
  return (
    <div className="fade-in">
      {/* Hero title */}
      <div style={{ padding: '28px 0 20px', textAlign: 'center' }}>
        <div className="hero-title">CHAMPIONS</div>
        <div style={{ fontSize: 14, color: '#6e7681', marginTop: 8, letterSpacing: 3 }}>
          Explore the full League of Legends roster
        </div>
      </div>

      {/* Filters */}
      <div className="filters-wrap">
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: '#6e7681', fontSize: 18, pointerEvents: 'none',
          }}>⌕</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search champion..."
            style={{
              width: '100%', background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.1)', borderRadius: 8,
              padding: '10px 14px 10px 42px', color: '#e8eaed', fontSize: 15,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

        {/* Roles */}
        <div className="filter-row">
          {ALL_ROLES.map((r) => (
            <button key={r} className="filter-btn" onClick={() => setFilterRole(r)} style={{
              padding: '5px 11px', borderRadius: 20, fontSize: 12,
              fontFamily: 'inherit',
              background: filterRole === r ? '#c8a032' : 'rgba(255,255,255,.05)',
              color: filterRole === r ? '#0a0a0f' : '#9aa3af',
              border: filterRole === r ? '1px solid #c8a032' : '1px solid rgba(255,255,255,.1)',
              fontWeight: filterRole === r ? 700 : 400,
            }}>{r}</button>
          ))}
        </div>

        {/* Tiers + Sort */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="filter-row" style={{ gap: 6 }}>
            {ALL_TIERS.map((t) => (
              <button key={t} className="filter-btn" onClick={() => setFilterTier(t)} style={{
                padding: '5px 9px', borderRadius: 6, fontSize: 12,
                fontFamily: 'inherit', fontWeight: 700,
                background: filterTier === t
                  ? (t === 'All' ? '#c8a032' : TIER_COLORS[t].bg)
                  : 'rgba(255,255,255,.05)',
                color: filterTier === t
                  ? (t === 'All' ? '#0a0a0f' : TIER_COLORS[t].text)
                  : '#9aa3af',
                border: '1px solid rgba(255,255,255,.1)',
              }}>{t}</button>
            ))}
          </div>

          <div className="sort-row">
            <span style={{ fontSize: 12, color: '#6e7681' }}>Sort:</span>
            {(['name', 'tier', 'winrate'] as SortOption[]).map((v) => (
              <button key={v} className="filter-btn" onClick={() => setSortBy(v)} style={{
                padding: '4px 9px', borderRadius: 6, fontSize: 12, fontFamily: 'inherit',
                background: sortBy === v ? 'rgba(200,160,50,.18)' : 'transparent',
                color: sortBy === v ? '#c8a032' : '#6e7681',
                border: sortBy === v ? '1px solid rgba(200,160,50,.4)' : '1px solid transparent',
                textTransform: 'capitalize',
              }}>{v}</button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 13, color: '#6e7681' }}>{champions.length} champions found</div>
      </div>

      {/* Cards grid */}
      <div className="champ-grid">
        {champions.map((champ) => (
          <ChampionCard
            key={champ.id}
            champion={champ}
            tier={getBestTier(champ.id)}
            tierData={championTierMap[champ.id]}
            onClick={() => onSelect(champ)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Champion Card ────────────────────────────────────────────────────────────

interface ChampionCardProps {
  champion: Champion
  tier: ChampionTier['tier'] | null
  tierData: Record<string, ChampionTier> | undefined
  onClick: () => void
}

function ChampionCard({ champion, tier, tierData, onClick }: ChampionCardProps) {
  const avgWinRate = tierData
    ? (
        Object.values(tierData).reduce((s, t) => s + t.stats.winRate, 0) /
        Object.keys(tierData).length
      ).toFixed(1)
    : null

  const winRateColor =
    avgWinRate === null
      ? '#9aa3af'
      : parseFloat(avgWinRate) >= 52
      ? '#51cf66'
      : parseFloat(avgWinRate) >= 48
      ? '#c8a032'
      : '#ff6b6b'

  const firstTag = champion.tags?.[0]

  return (
    <div className="champ-card fade-in" onClick={onClick} style={{
      background: 'rgba(13,17,23,.95)',
      border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 10, overflow: 'hidden', position: 'relative',
    }}>
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', height: 150 }}>
        <img
          src={champion.image?.url}
          alt={champion.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
          loading="lazy"
          onError={(e) => {
            const img = e.target as HTMLImageElement
            img.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom,transparent 50%,rgba(10,10,15,.95) 100%)',
        }} />
        {tier && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            background: TIER_COLORS[tier].bg, color: TIER_COLORS[tier].text,
            fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, letterSpacing: 1,
          }}>{tier}</div>
        )}
        {firstTag && ROLE_COLORS[firstTag] && (
          <div style={{
            position: 'absolute', top: 6, left: 6,
            background: ROLE_COLORS[firstTag].bg,
            color: ROLE_COLORS[firstTag].text,
            border: `1px solid ${ROLE_COLORS[firstTag].border}55`,
            fontSize: 9, padding: '2px 5px', borderRadius: 4,
            letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600,
          }}>{firstTag}</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e8eaed', lineHeight: 1.1 }}>
          {champion.name}
        </div>
        <div style={{ fontSize: 10, color: '#6e7681', marginTop: 2, marginBottom: 6, lineHeight: 1.2 }}>
          {champion.title}
        </div>
        {avgWinRate && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#6e7681' }}>WR</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: winRateColor }}>{avgWinRate}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Detail View ──────────────────────────────────────────────────────────────

interface DetailViewProps {
  champion: Champion
  tiers: Record<string, ChampionTier>
  build: Build | null
  skins: Skin[]
  abilities: Ability[]
  activeTab: ActiveTab
  setActiveTab: (t: ActiveTab) => void
}

const TABS: { id: ActiveTab; label: string }[] = [
  { id: 'overview',   label: 'Overview' },
  { id: 'tiers',      label: 'Tier & Stats' },
  { id: 'abilities',  label: 'Abilities' },
  { id: 'build',      label: 'Build' },
  { id: 'skins',      label: 'Skins' },
]

function DetailView({ champion, tiers, build, skins, abilities, activeTab, setActiveTab }: DetailViewProps) {
  const splashUrl =
    skins[0]?.images?.splash ??
    `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`

  return (
    <div className="fade-in">
      {/* Splash Hero */}
      <div className="detail-hero">
        <img
          src={splashUrl}
          alt={champion.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg,rgba(10,10,15,.92) 0%,rgba(10,10,15,.38) 55%,rgba(10,10,15,.08) 100%)',
        }} />
        <div className="detail-hero-info">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <img
              src={champion.image?.url}
              alt={champion.name}
              className="detail-avatar"
              style={{ borderRadius: 8, border: '2px solid #c8a032', boxShadow: '0 0 20px rgba(200,160,50,.4)', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div className="detail-champ-name">
                {champion.name.toUpperCase()}
              </div>
              <div style={{ fontSize: 14, color: '#c8a032', letterSpacing: 2, marginTop: 2 }}>
                {champion.title}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {champion.tags?.map((tag) => (
                  <span key={tag} style={{
                    background: ROLE_COLORS[tag]?.bg ?? '#1a1a2a',
                    color: ROLE_COLORS[tag]?.text ?? '#fff',
                    border: `1px solid ${ROLE_COLORS[tag]?.border ?? '#555'}66`,
                    fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, letterSpacing: 1,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs — horizontal scroll on mobile */}
      <div className="tabs-scroll" style={{
        borderBottom: '1px solid rgba(255,255,255,.08)',
        marginBottom: 20,
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className="tab-btn"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 14px', fontSize: 13, fontFamily: 'inherit', fontWeight: 600,
              color: activeTab === tab.id ? '#c8a032' : '#6e7681', letterSpacing: 1,
              borderBottom: activeTab === tab.id ? '2px solid #c8a032' : '2px solid transparent',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'overview'  && <OverviewTab champion={champion} />}
      {activeTab === 'tiers'     && <TiersTab tiers={tiers} />}
      {activeTab === 'abilities' && <AbilitiesTab abilities={abilities} />}
      {activeTab === 'build'     && <BuildTab build={build} />}
      {activeTab === 'skins'     && <SkinsTab skins={skins} />}
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ champion }: { champion: Champion }) {
  const { stats, info } = champion
  const combatBars = [
    { label: 'Attack',     value: info.attack,     max: 10, color: '#ff6b6b' },
    { label: 'Defense',    value: info.defense,    max: 10, color: '#4dabf7' },
    { label: 'Magic',      value: info.magic,      max: 10, color: '#cc5de8' },
    { label: 'Difficulty', value: info.difficulty, max: 10, color: '#ffd43b' },
  ]
  const statCards = [
    { label: 'HP',          value: stats.hp },
    { label: 'Atk Damage',  value: stats.attackdamage },
    { label: 'Armor',       value: stats.armor },
    { label: 'Move Speed',  value: stats.movespeed },
    { label: 'Atk Range',   value: stats.attackrange },
    { label: 'HP / Nivel',  value: stats.hpperlevel },
  ]

  return (
    <div className="fade-in overview-grid">
      {/* Lore */}
      <div className="overview-lore" style={{
        background: 'rgba(13,17,23,.8)', border: '1px solid rgba(200,160,50,.15)',
        borderLeft: '3px solid #c8a032', borderRadius: 10, padding: '18px 20px',
      }}>
        <div style={{ fontSize: 11, color: '#c8a032', letterSpacing: 3, marginBottom: 10, textTransform: 'uppercase' }}>History</div>
        <p style={{ fontSize: 15, color: '#9aa3af', lineHeight: 1.75 }}>{champion.blurb}</p>
      </div>

      {/* Combat profile */}
      <div style={{ background: 'rgba(13,17,23,.8)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: 18 }}>
        <div style={{ fontSize: 11, color: '#6e7681', letterSpacing: 3, marginBottom: 14, textTransform: 'uppercase' }}>Combat profile</div>
        {combatBars.map((bar) => (
          <div key={bar.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 13, color: '#9aa3af' }}>{bar.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: bar.color }}>{bar.value}/10</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div className="stat-bar-fill" style={{
                height: '100%', background: bar.color,
                width: `${(bar.value / bar.max) * 100}%`, borderRadius: 2, opacity: 0.85,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Base stats */}
      <div style={{ background: 'rgba(13,17,23,.8)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: 18 }}>
        <div style={{ fontSize: 11, color: '#6e7681', letterSpacing: 3, marginBottom: 14, textTransform: 'uppercase' }}>Stats Base</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {statCards.map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#6e7681', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#e8eaed' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tiers Tab ────────────────────────────────────────────────────────────────

function TiersTab({ tiers }: { tiers: Record<string, ChampionTier> }) {
  const tierList = Object.values(tiers)
  if (!tierList.length) return <EmptyState text="No tier data available" />

  return (
    <div className="fade-in" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        {tierList.map((tierData) => {
          const tc = TIER_COLORS[tierData.tier]
          return (
            <div key={tierData.role} style={{
              background: 'rgba(13,17,23,.8)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 12, padding: 18, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: 70, height: 70, borderRadius: '0 12px 0 70px',
                background: `${tc?.bg ?? '#555'}22`,
                display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                padding: '10px 14px',
              }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: tc?.bg ?? '#555' }}>{tierData.tier}</span>
              </div>

              <div style={{ fontSize: 11, color: '#6e7681', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' }}>Rol</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#e8eaed', marginBottom: 14 }}>{tierData.role}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  {
                    label: 'Winrate',
                    value: `${tierData.stats.winRate.toFixed(1)}%`,
                    color: tierData.stats.winRate >= 52 ? '#51cf66' : tierData.stats.winRate >= 48 ? '#c8a032' : '#ff6b6b',
                  },
                  { label: 'Pickrate', value: `${tierData.stats.pickRate.toFixed(1)}%`, color: '#4dabf7' },
                  { label: 'Banrate',  value: `${tierData.stats.banRate.toFixed(1)}%`,  color: '#ff6b6b' },
                  { label: 'Matches', value: tierData.stats.matches.toLocaleString(),  color: '#9aa3af' },
                ].map((s) => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: '#6e7681', marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Abilities Tab ────────────────────────────────────────────────────────────

const SLOT_ORDER: Ability['slot'][] = ['P', 'Q', 'W', 'E', 'R']

function AbilitiesTab({ abilities }: { abilities: Ability[] }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const ordered = SLOT_ORDER.map((s) => abilities.find((a) => a.slot === s)).filter(Boolean) as Ability[]

  if (!ordered.length) return <EmptyState text="There is no skills data available" />

  const active = ordered[selectedIdx]

  return (
    <div className="fade-in" style={{ paddingBottom: 48 }}>
      {/* Slot buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {ordered.map((ab, i) => (
          <button
            key={ab.slot}
            onClick={() => setSelectedIdx(i)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              background: selectedIdx === i ? 'rgba(200,160,50,.15)' : 'rgba(255,255,255,.04)',
              border: selectedIdx === i ? '1px solid rgba(200,160,50,.6)' : '1px solid rgba(255,255,255,.08)',
              borderRadius: 10, padding: '10px 14px', cursor: 'pointer', minWidth: 72,
              transition: 'all .2s',
            }}
          >
            <img
              src={ab.image?.url}
              alt={ab.name}
              style={{ width: 44, height: 44, borderRadius: 6 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span style={{ fontSize: 15, fontWeight: 700, color: selectedIdx === i ? '#c8a032' : '#9aa3af' }}>
              {ab.slot}
            </span>
          </button>
        ))}
      </div>

      {/* Active ability detail */}
      {active && (
        <div className="ability-detail">
          <img
            src={active.image?.url}
            alt={active.name}
            style={{ width: 64, height: 64, borderRadius: 8, flexShrink: 0, border: '1px solid rgba(200,160,50,.3)' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, color: '#c8a032', letterSpacing: 2,
                background: 'rgba(200,160,50,.1)', padding: '2px 8px', borderRadius: 4,
              }}>{active.slot}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#e8eaed' }}>{active.name}</span>
            </div>
            <p style={{ fontSize: 14, color: '#9aa3af', lineHeight: 1.7, marginBottom: 12 }}>
              {active.description}
            </p>
            {active.cooldown.length > 0 && active.cooldown[0] > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#6e7681' }}>Cooldown:</span>
                {active.cooldown.map((cd, i) => (
                  <span key={i} style={{
                    fontSize: 12, background: 'rgba(255,255,255,.06)', color: '#4dabf7',
                    padding: '3px 8px', borderRadius: 4,
                  }}>{cd}s</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Build Tab ────────────────────────────────────────────────────────────────

function BuildTab({ build }: { build: Build | null }) {
  if (!build) return <EmptyState text="No recommended build available" />
  const { profile, recommended_build } = build

  return (
    <div className="fade-in build-grid">
      {/* Profile */}
      <div style={{ background: 'rgba(13,17,23,.8)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 11, color: '#6e7681', letterSpacing: 3, marginBottom: 14, textTransform: 'uppercase' }}>Champion profile</div>
        {[
          { label: 'Damage type', value: profile.damage_type },
          { label: 'Resource',      value: profile.resource_type },
          { label: 'Uses Mana',     value: profile.uses_mana ? 'Yes' : 'No' },
        ].map((row) => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)',
          }}>
            <span style={{ fontSize: 14, color: '#6e7681' }}>{row.label}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#c8a032' }}>{row.value}</span>
          </div>
        ))}
        {recommended_build.playstyle && (
          <p style={{ fontSize: 13, color: '#6e7681', lineHeight: 1.6, marginTop: 12 }}>
            {recommended_build.playstyle}
          </p>
        )}
      </div>

      {/* Items */}
      <div style={{ background: 'rgba(13,17,23,.8)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 11, color: '#6e7681', letterSpacing: 3, marginBottom: 14, textTransform: 'uppercase' }}>Recommended Items</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recommended_build.items.map((item, i) => (
            <div key={item} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '8px 12px',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(200,160,50,.2)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#c8a032',
              }}>{i + 1}</div>
              {recommended_build.item_images?.[item] && (
                <img
                  src={recommended_build.item_images[item]}
                  alt={item}
                  style={{ width: 32, height: 32, borderRadius: 6 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <span style={{ fontSize: 14, color: '#e8eaed' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Skins Tab ────────────────────────────────────────────────────────────────

function SkinsTab({ skins }: { skins: Skin[] }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  if (!skins.length) return <EmptyState text="No recommended skins available" />

  const activeSkin = skins[selectedIdx]

  return (
    <div className="fade-in skins-grid">
      {/* Splash */}
      <div style={{ borderRadius: 12, overflow: 'hidden', background: '#0a0a0f', border: '1px solid rgba(255,255,255,.08)' }}>
        <img
          src={activeSkin.images?.splash}
          alt={activeSkin.skinName}
          style={{ width: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            const img = e.target as HTMLImageElement
            img.src = activeSkin.images?.loading ?? ''
          }}
        />
        <div style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#e8eaed' }}>{activeSkin.skinName}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {activeSkin.rarity && (
              <span style={{ fontSize: 12, color: '#c8a032', background: 'rgba(200,160,50,.1)', padding: '2px 8px', borderRadius: 4 }}>
                {activeSkin.rarity}
              </span>
            )}
            {activeSkin.isBaseSkin && (
              <span style={{ fontSize: 12, color: '#6e7681', background: 'rgba(255,255,255,.05)', padding: '2px 8px', borderRadius: 4 }}>
                Skin base
              </span>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="skins-list">
        {skins.map((skin, i) => (
          <button
            key={skin.skinId}
            onClick={() => setSelectedIdx(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              background: selectedIdx === i ? 'rgba(200,160,50,.15)' : 'rgba(255,255,255,.04)',
              border: selectedIdx === i ? '1px solid rgba(200,160,50,.4)' : '1px solid rgba(255,255,255,.06)',
              borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              transition: 'all .18s',
            }}
          >
            <img
              src={skin.images?.tile}
              alt={skin.skinName}
              style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: selectedIdx === i ? '#c8a032' : '#e8eaed', lineHeight: 1.2 }}>
                {skin.skinName}
              </div>
              {skin.rarity && <div style={{ fontSize: 11, color: '#6e7681' }}>{skin.rarity}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6e7681' }}>
      <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>◈</div>
      <div style={{ fontSize: 16 }}>{text}</div>
    </div>
  )
}
