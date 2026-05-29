import { Display, MicroLabel, Tile } from './ui'
import { FAMILY, fmtNum } from '../theme'

export default function ExerciseCard({ palette, items, onAdd, onDelete }) {
  const total = items.reduce((s, e) => s + e.kcal, 0)

  return (
    <Tile palette={palette} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <MicroLabel>Movimiento · Hoy</MicroLabel>
        <button onClick={onAdd} style={{
          background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
          color: palette.accent, fontFamily: 'inherit',
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
          fontWeight: 600, borderBottom: `1px solid ${palette.accent}`, paddingBottom: 2,
        }}>+ Registrar</button>
      </div>

      <div style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <Display size={88} style={{ color: palette.accent }}>{fmtNum(total)}</Display>
        <span style={{
          fontSize: 14, opacity: 0.7,
          letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
        }}>kcal quemadas</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7, letterSpacing: '0.02em' }}>
        {items.length} {items.length === 1 ? 'actividad' : 'actividades'}
      </div>

      <div style={{ marginTop: 24, flex: 1 }}>
        {items.length === 0 ? (
          <div style={{ padding: '20px 0', opacity: 0.55, fontSize: 13 }}>
            Aún sin movimiento hoy.
          </div>
        ) : (
          items.map(it => (
            <div key={it.id} style={{
              display: 'grid',
              gridTemplateColumns: '50px 1fr auto',
              alignItems: 'baseline',
              gap: 16,
              padding: '14px 0',
              borderBottom: `1px solid ${palette.ink}22`,
            }}>
              <div style={{
                fontSize: 11, opacity: 0.7,
                fontVariantNumeric: 'tabular-nums',
                fontFamily: FAMILY.mono,
              }}>{it.time}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{it.name}</div>
                <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>{it.duration}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div style={{
                  fontFamily: FAMILY.display, fontSize: 18, fontWeight: 400,
                  color: palette.accent, fontVariantNumeric: 'tabular-nums',
                }}>
                  −{it.kcal}
                  <span style={{
                    fontFamily: FAMILY.body, fontSize: 10, marginLeft: 4,
                    opacity: 0.6, letterSpacing: '0.18em', textTransform: 'uppercase',
                  }}>kcal</span>
                </div>
                <button onClick={() => onDelete(it.id)} style={{
                  background: 'transparent', border: 0, color: 'inherit',
                  cursor: 'pointer', fontSize: 14, padding: 0, opacity: 0.4,
                }}>×</button>
              </div>
            </div>
          ))
        )}
      </div>
    </Tile>
  )
}
