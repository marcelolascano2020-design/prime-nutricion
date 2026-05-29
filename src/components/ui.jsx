import { FAMILY } from '../theme'

export function MicroLabel({ children, color, style }) {
  return (
    <div style={{
      fontSize: 10,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      fontWeight: 500,
      color: color || 'currentColor',
      opacity: 0.7,
      ...style,
    }}>
      {children}
    </div>
  )
}

export function Display({ children, size = 80, style }) {
  return (
    <div style={{
      fontFamily: FAMILY.display,
      fontWeight: 400,
      fontSize: size,
      lineHeight: 0.92,
      letterSpacing: '-0.02em',
      fontVariantNumeric: 'tabular-nums',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function Track({ pct, color, height = 3 }) {
  return (
    <div style={{ position: 'relative', height, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'currentColor', opacity: 0.18, borderRadius: 999,
      }} />
      <div style={{
        position: 'absolute', left: 0, top: 0, height: '100%',
        width: Math.min(100, Math.max(0, pct)) + '%',
        background: color || 'currentColor',
        borderRadius: 999,
        transition: 'width .7s cubic-bezier(.2,.7,.2,1)',
      }} />
    </div>
  )
}

export function Tile({ palette, children, style }) {
  return (
    <div style={{
      background: palette.bg,
      color: palette.ink,
      borderRadius: 28,
      padding: 32,
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      boxSizing: 'border-box',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function MiniStat({ label, value, unit, color }) {
  return (
    <div style={{ minWidth: 0 }}>
      <MicroLabel style={{ fontSize: 9 }}>{label}</MicroLabel>
      <div style={{
        marginTop: 8,
        fontFamily: FAMILY.display,
        fontWeight: 400,
        fontSize: 26,
        lineHeight: 1,
        letterSpacing: '-0.015em',
        fontVariantNumeric: 'tabular-nums',
        color: color || 'inherit',
        whiteSpace: 'nowrap',
      }}>
        {value}
        <span style={{
          fontFamily: FAMILY.body,
          fontSize: 9,
          marginLeft: 4,
          opacity: 0.6,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>{unit}</span>
      </div>
    </div>
  )
}
