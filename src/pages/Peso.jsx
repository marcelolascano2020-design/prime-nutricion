import { FAMILY } from '../theme'
import WeightCard from '../components/WeightCard'

const SEED_WEIGHT = [
  { day: -84, kg: 82.0 }, { day: -70, kg: 81.2 }, { day: -56, kg: 80.1 },
  { day: -42, kg: 78.6 }, { day: -28, kg: 77.1 }, { day: -14, kg: 75.8 },
  { day: -7,  kg: 75.2 }, { day: 0,   kg: 74.8 },
]

export default function Peso({ theme }) {
  return (
    <div style={{ minHeight: '100vh', padding: '40px 40px 120px', fontFamily: FAMILY.body }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
            Módulo · Fase 1
          </div>
          <div style={{ fontFamily: FAMILY.display, fontWeight: 400, fontSize: 52, lineHeight: 0.92, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
            Peso
          </div>
          <div style={{ marginTop: 14, fontSize: 14, opacity: 0.55, lineHeight: 1.6, maxWidth: 520 }}>
            Registro periódico del peso con sparkline de evolución y proyección hacia el objetivo.
          </div>
        </div>

        <div style={{ maxWidth: 400 }}>
          <WeightCard
            palette={theme.tiles.weight}
            history={SEED_WEIGHT}
            start={82.0} goal={70.0}
            onLog={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
