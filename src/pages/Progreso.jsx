import { FAMILY } from '../theme'
import { Tile, MicroLabel, Display } from '../components/ui'

export default function Progreso({ theme }) {
  return (
    <div style={{ minHeight: '100vh', padding: '40px 40px 120px', fontFamily: FAMILY.body }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
            Módulo · Fase 1
          </div>
          <div style={{ fontFamily: FAMILY.display, fontWeight: 400, fontSize: 52, lineHeight: 0.92, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
            Progreso
          </div>
          <div style={{ marginTop: 14, fontSize: 14, opacity: 0.55, lineHeight: 1.6, maxWidth: 520 }}>
            Galería de fotos del físico: timeline cronológica y comparador A vs. B para ver la evolución.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <Tile key={i} palette={theme.tiles.photo} style={{ padding: 0, aspectRatio: '3/4', cursor: 'pointer' }}>
              <div style={{
                width: '100%', height: '100%', padding: 20,
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                boxSizing: 'border-box',
              }}>
                <MicroLabel style={{ opacity: 0.5 }}>Foto {i}</MicroLabel>
                <div style={{ marginTop: 4, fontSize: 13, opacity: 0.4 }}>Sin imagen</div>
              </div>
            </Tile>
          ))}

          <Tile palette={theme.tiles.log} style={{ aspectRatio: '3/4', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999,
              background: theme.tiles.log.accent,
              color: theme.tiles.log.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 300,
            }}>+</div>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, opacity: 0.7 }}>
              Subir foto
            </div>
          </Tile>
        </div>

        <div style={{ marginTop: 32 }}>
          <Tile palette={theme.tiles.week} style={{ padding: 28 }}>
            <MicroLabel>Comparador A vs. B</MicroLabel>
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['Foto A', 'Foto B'].map(label => (
                <div key={label} style={{
                  background: `${theme.tiles.week.ink}08`, borderRadius: 16,
                  aspectRatio: '3/4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: 13, opacity: 0.3, fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>
          </Tile>
        </div>
      </div>
    </div>
  )
}
