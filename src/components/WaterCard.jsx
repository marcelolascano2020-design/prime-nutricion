import { Display, MicroLabel, Track, Tile } from './ui'

const AMOUNTS = [0.25, 0.5, 1.0]

export default function WaterCard({ palette, liters, goal, onAdd }) {
  const pct       = Math.min(100, (liters / goal) * 100)
  const remaining = Math.max(0, goal - liters)
  const reached   = liters >= goal

  // Vasos visuales: cada gota = 0.25 L
  const totalDrops   = Math.round(goal / 0.25)
  const filledDrops  = Math.min(totalDrops, Math.round(liters / 0.25))

  return (
    <Tile palette={palette} style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <MicroLabel>Hidratación · Hoy</MicroLabel>
        <MicroLabel style={{ color: palette.accent, opacity: 1 }}>
          objetivo {goal} L
        </MicroLabel>
      </div>

      {/* Número principal */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <Display size={88} style={{ color: palette.accent }}>{liters.toFixed(1)}</Display>
        <span style={{ fontSize: 14, opacity: 0.7, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>
          L
        </span>
        <span style={{ flex: 1 }} />
        <span style={{
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          fontWeight: 600, opacity: reached ? 1 : 0.5,
          color: reached ? palette.accent : 'inherit',
        }}>
          {reached ? '✓ Meta' : `−${remaining.toFixed(2)} L`}
        </span>
      </div>

      {/* Barra de progreso */}
      <div style={{ marginTop: 16 }}>
        <Track pct={pct} color={palette.accent} />
      </div>

      {/* Gotas visuales */}
      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {Array.from({ length: totalDrops }).map((_, i) => (
          <div key={i} style={{
            width: 10, height: 14,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: i < filledDrops ? palette.accent : 'transparent',
            border: `1.5px solid ${palette.accent}`,
            opacity: i < filledDrops ? 1 : 0.3,
            transition: 'background .25s ease, opacity .25s ease',
          }} />
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 16 }} />

      {/* Botones + */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.5, marginBottom: 8 }}>
          Agregar
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {AMOUNTS.map(amt => (
            <button key={amt} onClick={() => onAdd(amt)} style={{
              flex: 1,
              background: 'transparent',
              border: `1px solid ${palette.accent}`,
              color: palette.accent,
              borderRadius: 999,
              padding: '10px 0',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background .15s, color .15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = palette.accent
                e.currentTarget.style.color = palette.bg || '#0E0F0C'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = palette.accent
              }}
            >
              +{amt}
            </button>
          ))}
        </div>
      </div>

      {/* Botones - */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.5, marginBottom: 8 }}>
          Quitar
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {AMOUNTS.map(amt => (
            <button key={amt} onClick={() => onAdd(-amt)} disabled={liters <= 0} style={{
              flex: 1,
              background: 'transparent',
              border: `1px solid currentColor`,
              color: 'inherit',
              borderRadius: 999,
              padding: '10px 0',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: liters > 0 ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              opacity: liters > 0 ? 0.6 : 0.2,
              transition: 'opacity .15s',
            }}>
              −{amt}
            </button>
          ))}
        </div>
      </div>

    </Tile>
  )
}
