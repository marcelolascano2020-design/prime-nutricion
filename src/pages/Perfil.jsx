import { FAMILY, THEMES } from '../theme'
import { Tile, MicroLabel, Display, Track } from '../components/ui'

const OBJETIVOS = [
  { key: 'lose',     label: 'Bajar de peso',  icon: '↓' },
  { key: 'maintain', label: 'Mantenimiento',  icon: '→' },
  { key: 'gain',     label: 'Ganar masa',     icon: '↑' },
]

export default function Perfil({ theme, themeKey, setThemeKey }) {
  return (
    <div style={{ minHeight: '100vh', padding: '40px 40px 120px', fontFamily: FAMILY.body }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
            Configuración
          </div>
          <div style={{ fontFamily: FAMILY.display, fontWeight: 400, fontSize: 52, lineHeight: 0.92, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
            Perfil
          </div>
          <div style={{ marginTop: 14, fontSize: 14, opacity: 0.55, lineHeight: 1.6 }}>
            Objetivo, datos personales y preferencias visuales.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Datos */}
          <Tile palette={theme.tiles.log} style={{ padding: 28 }}>
            <MicroLabel style={{ marginBottom: 20 }}>Datos personales</MicroLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Nombre',    placeholder: 'Tu nombre' },
                { label: 'Username',  placeholder: 'prime.app/u/nombre' },
                { label: 'Altura',    placeholder: '175 cm' },
                { label: 'Nacimiento',placeholder: '1990' },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: 11, opacity: 0.55, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
                    {f.label}
                  </div>
                  <input
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', background: `${theme.tiles.log.ink}0A`,
                      border: `1px solid ${theme.tiles.log.ink}20`,
                      borderRadius: 10, padding: '10px 14px',
                      fontSize: 14, color: theme.tiles.log.ink,
                      fontFamily: FAMILY.body, outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>
          </Tile>

          {/* Objetivo */}
          <Tile palette={theme.tiles.macros} style={{ padding: 28 }}>
            <MicroLabel style={{ marginBottom: 20 }}>Objetivo</MicroLabel>
            <div style={{ display: 'flex', gap: 10 }}>
              {OBJETIVOS.map(o => (
                <div key={o.key} style={{
                  flex: 1, padding: '14px 16px', borderRadius: 14,
                  background: o.key === 'lose' ? theme.tiles.macros.ink : 'transparent',
                  color: o.key === 'lose' ? theme.tiles.macros.bg : theme.tiles.macros.ink,
                  border: o.key !== 'lose' ? `1.5px solid ${theme.tiles.macros.ink}30` : '1.5px solid transparent',
                  cursor: 'pointer', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{o.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>{o.label}</div>
                </div>
              ))}
            </div>
          </Tile>

          {/* Metas */}
          <Tile palette={theme.tiles.hero} style={{ padding: 28 }}>
            <MicroLabel style={{ marginBottom: 20 }}>Metas</MicroLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { label: 'Peso inicial', value: '82.0', unit: 'kg' },
                { label: 'Peso objetivo', value: '70.0', unit: 'kg' },
                { label: 'Agua diaria', value: '2.0', unit: 'L' },
              ].map(s => (
                <div key={s.label}>
                  <MicroLabel style={{ marginBottom: 8, fontSize: 9 }}>{s.label}</MicroLabel>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <Display size={36}>{s.value}</Display>
                    <span style={{ fontSize: 13, opacity: 0.6 }}>{s.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </Tile>

          {/* Paleta visual */}
          <Tile palette={theme.tiles.log} style={{ padding: 28 }}>
            <MicroLabel style={{ marginBottom: 20 }}>Paleta visual</MicroLabel>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(THEMES).map(([key, t]) => (
                <button key={key} onClick={() => setThemeKey(key)} style={{
                  flex: 1, padding: '16px 12px', borderRadius: 14,
                  background: t.page,
                  border: key === themeKey
                    ? `2px solid ${theme.tiles.log.ink}`
                    : `2px solid ${theme.tiles.log.ink}18`,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start',
                }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[t.pageInk, t.tiles.hero.bg, t.tiles.weight.bg].map((c, i) => (
                      <div key={i} style={{ width: 12, height: 12, borderRadius: 999, background: c }} />
                    ))}
                  </div>
                  <div style={{
                    fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                    fontWeight: 700, color: t.pageInk,
                  }}>{t.label}</div>
                </button>
              ))}
            </div>
          </Tile>

        </div>
      </div>
    </div>
  )
}
