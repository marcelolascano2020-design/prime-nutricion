import { useState } from 'react'
import { MicroLabel, Tile } from './ui'
import { FAMILY } from '../theme'

function MealThumb({ photo, tag, palette }) {
  if (photo) {
    return (
      <div style={{
        width: 60, height: 60, borderRadius: 12, flexShrink: 0,
        background: `url(${photo}) center/cover`,
      }} />
    )
  }
  return (
    <div style={{
      width: 60, height: 60, borderRadius: 12, flexShrink: 0,
      background: palette.accent + '22',
      border: `1px solid ${palette.accent}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: palette.accent,
    }}>
      <span style={{
        fontFamily: FAMILY.mono,
        fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
        opacity: 0.8,
      }}>{tag || '—'}</span>
    </div>
  )
}

function MealRow({ item, palette, onDelete, isLast }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      className="meal-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '56px 72px 1fr auto 24px',
        alignItems: 'center',
        gap: 20,
        padding: '16px 0',
        borderBottom: isLast ? 'none' : `1px solid ${palette.ink}22`,
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.65, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', fontFamily: FAMILY.mono }}>
        {item.time}
      </div>
      <MealThumb photo={item.photo} tag={item.tag} palette={palette} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, lineHeight: 1.3, fontWeight: 500 }}>{item.name}</div>
        <div style={{ marginTop: 4, fontSize: 11, opacity: 0.65, letterSpacing: '0.04em', fontFamily: FAMILY.mono }}>
          P {item.protein}g · C {item.carbs}g · G {item.fat}g
        </div>
      </div>
      <div style={{
        fontFamily: FAMILY.display, fontSize: 24, fontWeight: 400,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {item.kcal}
        <span style={{
          fontFamily: FAMILY.body, fontSize: 10, marginLeft: 4,
          opacity: 0.6, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500,
        }}>kcal</span>
      </div>
      <button onClick={onDelete} aria-label="Eliminar" className="meal-delete-btn" style={{
        opacity: hover ? 0.5 : 0,
        transition: 'opacity .2s',
        background: 'transparent', border: 0,
        color: 'inherit', cursor: 'pointer',
        fontSize: 16, padding: 0,
      }}>×</button>
    </div>
  )
}

export default function MealLogCard({ palette, items, onAdd, onDelete }) {
  return (
    <Tile palette={palette}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <MicroLabel>Registro del día · Alimentos</MicroLabel>
        <button onClick={onAdd} style={{
          background: palette.accent, color: palette.bg, border: 0,
          padding: '10px 18px',
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
          fontWeight: 600, cursor: 'pointer', borderRadius: 999,
          fontFamily: 'inherit',
        }}>+ Añadir comida</button>
      </div>

      <div style={{ marginTop: 20 }}>
        {items.length === 0 ? (
          <div style={{ padding: '32px 0', opacity: 0.5, fontSize: 13 }}>
            Aún no hay registros para hoy.
          </div>
        ) : (
          items.map((it, i) => (
            <MealRow
              key={it.id}
              item={it}
              palette={palette}
              onDelete={() => onDelete(it.id)}
              isLast={i === items.length - 1}
            />
          ))
        )}
      </div>
    </Tile>
  )
}
