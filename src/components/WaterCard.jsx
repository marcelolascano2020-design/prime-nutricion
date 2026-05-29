import { Display, MicroLabel, Track, Tile } from './ui'

export default function WaterCard({ palette, liters, goal, onAdd }) {
  const pct = Math.min(100, (liters / goal) * 100)
  const remaining = Math.max(0, goal - liters)

  return (
    <Tile palette={palette} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <MicroLabel>Hidratación · Hoy</MicroLabel>
        <MicroLabel style={{ color: palette.accent, opacity: 1 }}>
          objetivo {goal} L
        </MicroLabel>
      </div>

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <Display size={88} style={{ color: palette.accent }}>{liters.toFixed(1)}</Display>
        <span style={{
          fontSize: 14, opacity: 0.7,
          letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
        }}>L</span>
      </div>

      <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75, letterSpacing: '0.02em' }}>
        {remaining > 0
          ? `${remaining.toFixed(2)} L restantes`
          : '✓ Objetivo alcanzado'}
      </div>

      <div style={{ marginTop: 20 }}>
        <Track pct={pct} color={palette.accent} />
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
        {[0.25, 0.5, 1.0].map(amt => (
          <button key={amt} onClick={() => onAdd(amt)} style={{
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
            cursor: 'pointer',
            fontFamily: 'inherit',
            opacity: 0.85,
            transition: 'opacity .15s',
          }}>
            +{amt}
          </button>
        ))}
      </div>
    </Tile>
  )
}
