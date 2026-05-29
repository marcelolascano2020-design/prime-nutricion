import { FAMILY } from '../theme'
import { Tile, MicroLabel } from '../components/ui'

const MOMENTOS = [
  { key: 'breakfast', label: 'Desayuno',         hora: '07:00 – 09:00', icon: '☀️' },
  { key: 'snack_am',  label: 'Colación mañana',  hora: '10:00 – 11:30', icon: '🍎' },
  { key: 'lunch',     label: 'Almuerzo',          hora: '12:00 – 14:00', icon: '🍽️' },
  { key: 'snack_pm',  label: 'Colación tarde',    hora: '16:00 – 17:00', icon: '🥜' },
  { key: 'tea',       label: 'Merienda',          hora: '17:00 – 19:00', icon: '☕' },
  { key: 'dinner',    label: 'Cena',              hora: '20:00 – 22:00', icon: '🌙' },
]

export default function Comidas({ theme }) {
  return (
    <div style={{ minHeight: '100vh', padding: '40px 40px 120px', fontFamily: FAMILY.body }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
            Módulo · Fase 1
          </div>
          <div style={{ fontFamily: FAMILY.display, fontWeight: 400, fontSize: 52, lineHeight: 0.92, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
            Comidas
          </div>
          <div style={{ marginTop: 14, fontSize: 14, opacity: 0.55, lineHeight: 1.6, maxWidth: 520 }}>
            Registro de los 6 momentos del día con foto, descripción y estimación de macros por IA.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {MOMENTOS.map(m => (
            <Tile key={m.key} palette={theme.tiles.log} style={{ padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{m.icon}</div>
              <MicroLabel style={{ marginBottom: 8 }}>{m.hora}</MicroLabel>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.01em' }}>{m.label}</div>
              <div style={{ marginTop: 16, opacity: 0.4, fontSize: 12, letterSpacing: '0.04em' }}>
                Sin registros hoy
              </div>
            </Tile>
          ))}
        </div>
      </div>
    </div>
  )
}
