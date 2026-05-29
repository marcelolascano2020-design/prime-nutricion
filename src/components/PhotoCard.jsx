import { MicroLabel, Tile } from './ui'

export default function PhotoCard({ palette, latestPhoto, latestName, onAdd }) {
  return (
    <Tile
      palette={palette}
      style={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        background: latestPhoto
          ? `linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55)), url(${latestPhoto}) center/cover`
          : palette.bg,
        color: latestPhoto ? '#fff' : palette.ink,
        cursor: 'pointer',
      }}
    >
      <div onClick={onAdd} style={{
        width: '100%', height: '100%', padding: 28,
        display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <MicroLabel>{latestPhoto ? 'Último plato' : 'Foto del día'}</MicroLabel>
          <MicroLabel style={{ opacity: 1 }}>+ Subir</MicroLabel>
        </div>
        <div style={{ flex: 1 }} />
        {latestPhoto ? (
          <div style={{ fontSize: 14, lineHeight: 1.3, fontWeight: 500 }}>{latestName}</div>
        ) : (
          <div style={{
            marginTop: 'auto',
            display: 'flex', flexDirection: 'column',
            alignItems: 'flex-start', gap: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999,
              background: palette.accent, color: palette.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 300, lineHeight: 0.5,
            }}>+</div>
            <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.35, maxWidth: 220 }}>
              Sube una foto de tu plato y la registramos por ti.
            </div>
          </div>
        )}
      </div>
    </Tile>
  )
}
