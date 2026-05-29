import { FAMILY } from '../theme'

export default function FloatingAdd({ onClick, theme }) {
  return (
    <button
      className="fab"
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
      style={{
        background: theme.pageInk,
        color: theme.page,
        border: 0,
        padding: '18px 32px 18px 24px',
        borderRadius: 999,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 16px 40px rgba(40,28,12,0.32), 0 2px 6px rgba(40,28,12,0.15)',
        transition: 'transform .2s ease',
        fontWeight: 600,
        fontFamily: FAMILY.body,
      }}
    >
      <span style={{
        fontFamily: FAMILY.display, fontSize: 26, fontWeight: 400, lineHeight: 0.8,
      }}>+</span>
      {/* fab-label: hidden on mobile via CSS */}
      <span className="fab-label" style={{
        fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
      }}>
        Registrar
      </span>
    </button>
  )
}
