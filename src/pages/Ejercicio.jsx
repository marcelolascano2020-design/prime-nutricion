import { useState } from 'react'
import { FAMILY } from '../theme'
import ExerciseCard from '../components/ExerciseCard'

const SEED = [
  { id: 1, time: '07:00', name: 'Caminata matutina', duration: '35 min', kcal: 180 },
]

export default function Ejercicio({ theme }) {
  const [items, setItems] = useState(SEED)

  return (
    <div style={{ minHeight: '100vh', padding: '40px 40px 120px', fontFamily: FAMILY.body }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
            Módulo · Fase 1
          </div>
          <div style={{ fontFamily: FAMILY.display, fontWeight: 400, fontSize: 52, lineHeight: 0.92, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
            Ejercicio
          </div>
          <div style={{ marginTop: 14, fontSize: 14, opacity: 0.55, lineHeight: 1.6, maxWidth: 520 }}>
            Registro de actividad física diaria: nombre, duración y estimación de calorías quemadas.
          </div>
        </div>

        <div style={{ maxWidth: 560 }}>
          <ExerciseCard
            palette={theme.tiles.exercise}
            items={items}
            onAdd={() => {}}
            onDelete={id => setItems(it => it.filter(i => i.id !== id))}
          />
        </div>
      </div>
    </div>
  )
}
