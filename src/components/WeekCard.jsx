import { MicroLabel, Tile } from './ui'
import { FAMILY, fmtNum } from '../theme'

export default function WeekCard({ palette, data, goal }) {
  const max = Math.max(goal, ...data) * 1.15
  const days = ['Mié', 'Jue', 'Vie', 'Sáb', 'Dom', 'Lun', 'Hoy']

  return (
    <Tile palette={palette}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <MicroLabel>Últimos 7 días · kcal</MicroLabel>
        <MicroLabel>Objetivo {fmtNum(goal)} kcal</MicroLabel>
      </div>

      <div
        className="week-chart-grid"
        style={{
          marginTop: 28,
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: 20,
          alignItems: 'end',
          height: 200,
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', left: 0, right: 0,
          bottom: `${(goal / max) * 100}%`,
          height: 1,
          borderTop: '1px dashed currentColor',
          opacity: 0.4,
        }} />

        {data.map((v, i) => {
          const h = (v / max) * 100
          const isToday = i === data.length - 1
          return (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              height: '100%',
            }}>
              <div style={{
                fontFamily: FAMILY.display, fontWeight: 400, fontSize: 14,
                fontVariantNumeric: 'tabular-nums',
                color: isToday ? palette.accent : palette.ink,
                opacity: isToday ? 1 : 0.7,
                marginBottom: 10,
              }}>{fmtNum(v)}</div>
              <div style={{
                width: '100%', maxWidth: 36,
                background: isToday ? palette.accent : 'currentColor',
                opacity: isToday ? 1 : 0.5,
                height: `${h}%`,
                borderRadius: 6,
              }} />
              <div style={{
                marginTop: 12,
                fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                opacity: isToday ? 1 : 0.6, fontWeight: 500,
              }}>
                {days[i]}
              </div>
            </div>
          )
        })}
      </div>
    </Tile>
  )
}
