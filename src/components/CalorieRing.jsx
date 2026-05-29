import { Display, MicroLabel } from './ui'
import { fmtNum } from '../theme'

export default function CalorieRing({ net, goal, palette, size = 220 }) {
  const stroke = 12
  const r = (size - stroke) / 2
  const C = 2 * Math.PI * r
  const dash = C * Math.min(1, Math.min(1.5, net / goal))
  const remaining = Math.max(0, goal - net)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="currentColor"
          strokeOpacity={0.18} strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={palette.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Display size={64} style={{ color: palette.accent }}>{fmtNum(remaining)}</Display>
        <MicroLabel style={{ marginTop: 6 }}>Restantes</MicroLabel>
      </div>
    </div>
  )
}
