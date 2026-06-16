'use client'
import { useState } from 'react'
import type { SummonerSpell } from '@/types'

const MODE_COLORS: Record<string, string> = { Classic: '#c8a032', ARAM: '#4dabf7' }

function formatCooldown(cd: number) {
  if (cd < 60) return `${cd}s`
  const m = Math.floor(cd / 60); const s = cd % 60
  return s ? `${m}m ${s}s` : `${m}m`
}

export default function SummonerSpellsView({ spells }: { spells: SummonerSpell[] }) {
  const [filterMode, setFilterMode] = useState('All')
  const modes = ['All', 'Classic', 'ARAM']

  const filtered = filterMode === 'All' ? spells : spells.filter(s => s.gameModes.includes(filterMode))

  return (
    <div className="ward-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f,#0d1117)', color: '#e8eaed', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        .ss-header {
          border-bottom: 1px solid rgba(200,160,50,.3);
          padding: 0 16px;
          height: 56px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(10,10,15,.96);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        @media(min-width:640px){ .ss-header { padding: 0 24px; height: 64px; gap: 16px; } }

        .ss-title {
          font-size: 30px;
          font-weight: 700;
          color: #c8a032;
          letter-spacing: 3px;
        }
        @media(min-width:640px){ .ss-title { font-size: 42px; letter-spacing: 4px; } }

        .ss-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media(min-width:480px){
          .ss-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
        }
      `}</style>

      <header className="ss-header">
        <a href="/" style={{ color: '#c8a032', textDecoration: 'none', fontSize: 13 }}>← Ward</a>
        <span style={{ color: '#21262d' }}>/</span>
        <span style={{ color: '#9aa3af', fontSize: 14, fontWeight: 600 }}>SUMMONER SPELLS</span>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="ss-title">SPELLS</div>
          <div style={{ fontSize: 14, color: '#6e7681', marginTop: 6, letterSpacing: 2 }}>All available Summoner Spells</div>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          {modes.map(m => (
            <button key={m} onClick={() => setFilterMode(m)} style={{
              padding: '8px 20px', borderRadius: 20, fontFamily: 'inherit', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: filterMode === m ? (MODE_COLORS[m] || '#c8a032') : 'rgba(255,255,255,.06)',
              color: filterMode === m ? '#0a0a0f' : '#9aa3af',
              border: filterMode === m ? `1px solid ${MODE_COLORS[m] || '#c8a032'}` : '1px solid rgba(255,255,255,.1)',
              transition: 'all .15s',
              minHeight: 40,
            }}>{m}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6e7681' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
            <div>No spells available. Add documents to the <code>summonerSpells</code> collection</div>
          </div>
        ) : (
          <div className="ss-grid">
            {filtered.map(spell => (
              <div key={spell.key} style={{
                background: 'rgba(13,17,23,.9)', border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 12, padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start',
                transition: 'border-color .2s',
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {spell.icon ? (
                    <img src={spell.icon} alt={spell.name} style={{ width: 52, height: 52, borderRadius: 8, border: '2px solid rgba(200,160,50,.3)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: 8, background: 'rgba(200,160,50,.1)', border: '2px solid rgba(200,160,50,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#e8eaed' }}>{spell.name}</span>
                    <span style={{ fontSize: 11, background: 'rgba(200,160,50,.15)', color: '#c8a032', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                      ⏱ {formatCooldown(spell.cooldown)}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#9aa3af', lineHeight: 1.5, marginBottom: 8 }}>{spell.description}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {spell.gameModes.map(mode => (
                      <span key={mode} style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                        background: `${MODE_COLORS[mode] || '#9aa3af'}18`,
                        color: MODE_COLORS[mode] || '#9aa3af',
                        border: `1px solid ${MODE_COLORS[mode] || '#9aa3af'}44`,
                      }}>{mode}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
