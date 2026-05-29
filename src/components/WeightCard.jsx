import { Display, MicroLabel, Track, Tile } from './ui'

export default function WeightCard({ palette, history, start, goal, onLog }) {
  const current = history.length ? history[history.length - 1].kg : start
  const lost = start - current
  const totalToLose = start - goal
  const pct = totalToLose > 0 ? Math.min(100, (lost / totalToLose) * 100) : 0

  const W = 100, H = 40
  const kgs = history.map(d => d.kg)
  const days = history.map(d => d.day)
  const minKg = Math.min(...kgs) - 0.5
  const maxKg = Math.max(...kgs) + 0.5
  const minDay = Math.min(...days)
  const maxDay = Math.max(...days)
  const x = d => ((d - minDay) / (maxDay - minDay || 1)) * W
  const y = k => H - ((k - minKg) / (maxKg - minKg || 1)) * H
  const pts = history.map(d => `${x(d.day).toFixed(2)},${y(d.kg).toFixed(2)}`).join(' ')
  const lastX = x(history[history.length - 1].day)
  const lastY = y(history[history.length - 1].kg)

  return (
    <Tile palette={palette} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <MicroLabel>Peso · Báscula</MicroLabel>
        <button onClick={onLog} style={{
          background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
          color: palette.ink, fontFamily: 'inherit',
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
          fontWeight: 600, borderBottom: `1px solid ${palette.ink}`, paddingBottom: 2,
        }}>+ Registrar</button>
      </div>

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <Display size={88}>{current.toFixed(1)}</Display>
        <span style={{ fontSize: 14, opacity: 0.7, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>kg</span>
      </div>

      <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75, letterSpacing: '0.02em' }}>
        −{lost.toFixed(1)} kg desde inicial
      </div>

      <div style={{ marginTop: 18 }}>
        <svg width="100%" height={44} viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={{ display: 'block', overflow: 'visible' }}>
          <polyline
            points={pts} fill="none" stroke="currentColor"
            strokeWidth={1.2} strokeOpacity={0.9}
            strokeLinejoin="round" strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={lastX} cy={lastY} r={2.4} fill="currentColor" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ marginTop: 12 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, opacity: 0.75, marginBottom: 8,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em',
        }}>
          <span>{start.toFixed(1)} <span style={{ opacity: 0.7 }}>inicial</span></span>
          <span style={{ fontWeight: 600, opacity: 1 }}>{pct.toFixed(0)}%</span>
          <span><span style={{ opacity: 0.7 }}>objetivo</span> {goal.toFixed(1)}</span>
        </div>
        <Track pct={pct} color={palette.ink} />
      </div>
    </Tile>
  )
}
