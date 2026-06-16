'use client'
import { useState } from 'react'
import type { PatchNotes, PatchChampionChange } from '@/types'

const CHANGE_COLORS = {
  buff:       { bg: '#1a3d2a', text: '#51cf66', label: 'BUFF' },
  nerf:       { bg: '#3d1a1a', text: '#ff6b6b', label: 'NERF' },
  adjustment: { bg: '#2a2a1a', text: '#ffd43b', label: 'ADJUST' },
}

export default function PatchNotesView({ patches }: { patches: PatchNotes[] }) {
  const [selected, setSelected] = useState<PatchNotes | null>(patches[0] ?? null)

  if (!patches.length) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#6e7681' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 18, color: '#c8a032' }}>No patch notes available</div>
          <p style={{ marginTop: 8, fontSize: 14, padding: '0 20px' }}>Connect your MongoDB and add documents to the <code>patchNotes</code> collection</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ward-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f,#0d1117)', color: '#e8eaed', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        .pn-header {
          border-bottom: 1px solid rgba(200,160,50,.3);
          padding: 0 16px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(10,10,15,.96);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        @media(min-width:640px){ .pn-header { padding: 0 24px; height: 64px; } }

        /* Mobile version selector */
        .pn-mobile-select {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        @media(min-width:768px){ .pn-mobile-select { display: none; } }

        /* Desktop sidebar */
        .pn-sidebar {
          display: none;
        }
        @media(min-width:768px){ .pn-sidebar { display: block; } }

        .pn-layout {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media(min-width:768px){
          .pn-layout { padding: 24px 20px; grid-template-columns: 220px 1fr; gap: 24px; }
        }
        @media(min-width:1024px){
          .pn-layout { grid-template-columns: 240px 1fr; }
        }

        .pn-hero {
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
          position: relative;
          height: 120px;
          background: #1a1a2a;
        }
        @media(min-width:480px){ .pn-hero { height: 160px; } }
        @media(min-width:768px){ .pn-hero { height: 200px; margin-bottom: 24px; } }

        .pn-hero-title {
          font-size: 20px;
          font-weight: 700;
          color: #c8a032;
          letter-spacing: 2px;
        }
        @media(min-width:480px){ .pn-hero-title { font-size: 28px; letter-spacing: 3px; } }
        @media(min-width:768px){ .pn-hero-title { font-size: 36px; } }

        .pn-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        @media(min-width:480px){ .pn-stats { grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; } }

        .pn-stat-value {
          font-size: 22px;
          font-weight: 700;
        }
        @media(min-width:480px){ .pn-stat-value { font-size: 28px; } }
      `}</style>

      {/* Header */}
      <header className="pn-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/" style={{ color: '#c8a032', textDecoration: 'none', fontSize: 13 }}>← Ward</a>
          <span style={{ color: '#21262d' }}>/</span>
          <span style={{ color: '#9aa3af', fontSize: 14, fontWeight: 600 }}>PATCH NOTES</span>
        </div>
        {selected && <span style={{ fontSize: 13, color: '#c8a032', fontWeight: 700 }}>Patch {selected.version}</span>}
      </header>

      <div className="pn-layout">
        {/* Desktop Sidebar */}
        <aside className="pn-sidebar">
          <div style={{ background: 'rgba(13,17,23,.9)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: 14, position: 'sticky', top: 72 }}>
            <div style={{ fontSize: 11, color: '#6e7681', letterSpacing: 3, marginBottom: 10, textTransform: 'uppercase' }}>Versions</div>
            {patches.map((p) => (
              <button key={p.version} onClick={() => setSelected(p)} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '9px 11px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
                background: selected?.version === p.version ? 'rgba(200,160,50,.15)' : 'transparent',
                border: selected?.version === p.version ? '1px solid rgba(200,160,50,.4)' : '1px solid transparent',
                color: selected?.version === p.version ? '#c8a032' : '#9aa3af', fontFamily: 'inherit',
                transition: 'all .15s',
              }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.version}</div>
                <div style={{ fontSize: 11, color: '#6e7681', marginTop: 2 }}>{new Date(p.releaseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main>
          {/* Mobile version picker */}
          <div className="pn-mobile-select">
            {patches.map((p) => (
              <button key={p.version} onClick={() => setSelected(p)} style={{
                padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                background: selected?.version === p.version ? 'rgba(200,160,50,.15)' : 'rgba(255,255,255,.05)',
                border: selected?.version === p.version ? '1px solid rgba(200,160,50,.4)' : '1px solid rgba(255,255,255,.08)',
                color: selected?.version === p.version ? '#c8a032' : '#9aa3af', fontSize: 13, fontWeight: 600,
              }}>
                {p.version}
              </button>
            ))}
          </div>

          {selected && (
            <>
              {/* Hero */}
              <div className="pn-hero">
                {selected.header.bannerImage && (
                  <img src={selected.header.bannerImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(10,10,15,.9),rgba(10,10,15,.4))', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                  <div>
                    <div className="pn-hero-title">PATCH {selected.version}</div>
                    <div style={{ fontSize: 13, color: '#9aa3af', marginTop: 4 }}>{selected.header.subtitle}</div>
                    <div style={{ fontSize: 11, color: '#6e7681', marginTop: 4 }}>By {selected.header.author}</div>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="pn-stats">
                {[
                  { label: 'Buffs',       value: selected.stats.buffedChampions,   color: '#51cf66' },
                  { label: 'Nerfs',       value: selected.stats.nerfedChampions,   color: '#ff6b6b' },
                  { label: 'Adjustments', value: selected.stats.adjustedChampions, color: '#ffd43b' },
                  { label: 'Items',       value: selected.stats.changedItems,       color: '#4dabf7' },
                  { label: 'Bugs',        value: selected.stats.bugFixes,           color: '#cc5de8' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(13,17,23,.9)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                    <div className="pn-stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: '#6e7681', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Champion Changes */}
              {selected.championChanges.length > 0 && (
                <section style={{ marginBottom: 28 }}>
                  <SectionTitle>Champion Changes</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {selected.championChanges.map((champ) => (
                      <ChampionChangeCard key={champ.championId} change={champ} />
                    ))}
                  </div>
                </section>
              )}

              {/* Item Changes */}
              {selected.itemChanges.length > 0 && (
                <section style={{ marginBottom: 28 }}>
                  <SectionTitle>Item Changes</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
                    {selected.itemChanges.map((item) => {
                      const cc = CHANGE_COLORS[item.changeType]
                      return (
                        <div key={item.itemId} style={{ background: 'rgba(13,17,23,.9)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            {item.image && <img src={item.image} alt="" style={{ width: 38, height: 38, borderRadius: 6 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: '#e8eaed' }}>{item.itemName}</div>
                              <span style={{ fontSize: 10, background: cc.bg, color: cc.text, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{cc.label}</span>
                            </div>
                          </div>
                          {item.changes.map((c, i) => (
                            <div key={i} style={{ fontSize: 13, color: '#9aa3af', marginBottom: 4 }}>
                              {c.description || (c.stat && <span><b style={{ color: '#e8eaed' }}>{c.stat}:</b> <span style={{ color: '#ff6b6b' }}>{c.before}</span> → <span style={{ color: '#51cf66' }}>{c.after}</span></span>)}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Rune Changes */}
              {selected.runeChanges.length > 0 && (
                <section style={{ marginBottom: 28 }}>
                  <SectionTitle>Rune Changes</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
                    {selected.runeChanges.map((rune) => {
                      const cc = CHANGE_COLORS[rune.changeType]
                      return (
                        <div key={rune.runeName} style={{ background: 'rgba(13,17,23,.9)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 700, color: '#e8eaed' }}>{rune.runeName}</div>
                            <span style={{ fontSize: 10, background: cc.bg, color: cc.text, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{cc.label}</span>
                          </div>
                          {rune.changes.map((c, i) => (
                            <div key={i} style={{ fontSize: 13, color: '#9aa3af' }}>
                              <b style={{ color: '#e8eaed' }}>{c.stat}:</b> <span style={{ color: '#ff6b6b' }}>{c.before}</span> → <span style={{ color: '#51cf66' }}>{c.after}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Bug Fixes */}
              {selected.bugFixes.length > 0 && (
                <section style={{ marginBottom: 32 }}>
                  <SectionTitle>Bug Fixes</SectionTitle>
                  <div style={{ background: 'rgba(13,17,23,.9)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: 18 }}>
                    {selected.bugFixes.map((fix, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < selected.bugFixes.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                        <span style={{ color: '#51cf66', marginTop: 2, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 14, color: '#9aa3af' }}>{fix}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, color: '#c8a032', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ height: 1, width: 20, background: '#c8a032' }} />
      {children}
      <div style={{ height: 1, flex: 1, background: 'rgba(200,160,50,.2)' }} />
    </div>
  )
}

function ChampionChangeCard({ change }: { change: PatchChampionChange }) {
  const [expanded, setExpanded] = useState(false)
  const cc = CHANGE_COLORS[change.changeType]
  return (
    <div style={{ background: 'rgba(13,17,23,.9)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, overflow: 'hidden' }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px',
        background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', textAlign: 'left',
      }}>
        {change.image && <img src={change.image} alt={change.championName} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', objectPosition: 'top', flexShrink: 0 }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#e8eaed' }}>{change.championName}</div>
          <div style={{ fontSize: 12, color: '#6e7681', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{change.summary}</div>
        </div>
        <span style={{ fontSize: 10, background: cc.bg, color: cc.text, padding: '3px 8px', borderRadius: 4, fontWeight: 700, flexShrink: 0 }}>{cc.label}</span>
        <span style={{ color: '#6e7681', fontSize: 16, flexShrink: 0 }}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          {change.changes.map((section, si) => (
            <div key={si} style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: '#c8a032', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 }}>
                {section.abilityName ? `${section.section} — ${section.abilityName}` : section.section}
              </div>
              {section.entries.map((entry, ei) => (
                <div key={ei} style={{ fontSize: 13, color: '#9aa3af', padding: '3px 0' }}>
                  <b style={{ color: '#e8eaed' }}>{entry.stat}:</b>{' '}
                  <span style={{ color: '#ff6b6b' }}>{entry.before}</span>
                  {' → '}
                  <span style={{ color: '#51cf66' }}>{entry.after}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
