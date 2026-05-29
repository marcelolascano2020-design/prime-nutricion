import { Display, MicroLabel, Track, Tile } from './ui'
import { FAMILY } from '../theme'

export default function MacrosCard({ palette, totals, goals }) {
  const macros = [
    { key: 'protein', label: 'Proteína', value: totals.protein, goal: goals.protein, suffix: 'g' },
    { key: 'carbs',   label: 'Carbohidratos', value: totals.carbs, goal: goals.carbs, suffix: 'g' },
    { key: 'fat',     label: 'Grasas', value: totals.fat, goal: goals.fat, suffix: 'g' },
  ]

  return (
    <Tile palette={palette}>
      <MicroLabel>Macronutrientes · Hoy</MicroLabel>
      <div style={{
        marginTop: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 36,
      }}>
        {macros.map(m => {
          const pct = Math.round((m.value / m.goal) * 100)
          return (
            <div key={m.key} style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.8, letterSpacing: '0.04em' }}>
                {m.label}
              </div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <Display size={64}>{m.value}</Display>
                <span style={{ fontSize: 16, opacity: 0.7 }}>{m.suffix}</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <Track pct={pct} color={palette.accent} />
              </div>
              <div style={{
                marginTop: 8,
                display: 'flex', justifyContent: 'space-between',
                fontSize: 11, opacity: 0.7,
                fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em',
                fontFamily: FAMILY.mono,
              }}>
                <span>{pct}% obj.</span>
                <span>de {m.goal}{m.suffix}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Tile>
  )
}
