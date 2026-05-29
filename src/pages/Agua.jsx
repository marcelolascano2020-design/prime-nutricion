import { useState } from 'react'
import { FAMILY } from '../theme'
import WaterCard from '../components/WaterCard'

export default function Agua({ theme }) {
  const [liters, setLiters] = useState(1.25)
  const GOAL = 2.0

  return (
    <div style={{ minHeight: '100vh', padding: '40px 40px 120px', fontFamily: FAMILY.body }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
            Módulo · Fase 1
          </div>
          <div style={{ fontFamily: FAMILY.display, fontWeight: 400, fontSize: 52, lineHeight: 0.92, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
            Hidratación
          </div>
          <div style={{ marginTop: 14, fontSize: 14, opacity: 0.55, lineHeight: 1.6, maxWidth: 520 }}>
            Seguimiento de ingesta de agua diaria con objetivo configurable en el perfil.
          </div>
        </div>

        <div style={{ maxWidth: 380 }}>
          <WaterCard
            palette={theme.tiles.water}
            liters={liters} goal={GOAL}
            onAdd={amt => setLiters(l => Math.min(GOAL + 1, +(l + amt).toFixed(2)))}
          />
        </div>
      </div>
    </div>
  )
}
