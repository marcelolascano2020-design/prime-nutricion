import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FAMILY, THEMES } from '../theme'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Inicio'    },
  { to: '/comidas',   icon: '🍽️', label: 'Comidas'  },
  { to: '/peso',      icon: '⚖️', label: 'Peso'     },
  { to: '/agua',      icon: '💧', label: 'Agua'     },
  { to: '/ejercicio', icon: '🏃', label: 'Ejercicio' },
  { to: '/progreso',  icon: '📸', label: 'Progreso'  },
  { to: '/perfil',    icon: '⚙️', label: 'Perfil'   },
]

function NavItem({ item, theme, onNavigate }) {
  const [hover, setHover] = useState(false)

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className="sidebar-nav-item"
      style={({ isActive }) => ({
        color: isActive ? theme.pageInk : `${theme.pageInk}99`,
        background: isActive
          ? `${theme.pageInk}0D`
          : hover ? `${theme.pageInk}08` : 'transparent',
        fontWeight: isActive ? 600 : 400,
      })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onNavigate}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="sidebar-active-bar"
              style={{ background: theme.accent }}
            />
          )}
          <span className="sidebar-nav-icon">{item.icon}</span>
          <span className="sidebar-nav-label">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

/**
 * Sidebar — desktop: fixed left panel
 *           mobile:  slide-in drawer (controlled by drawerOpen + onCloseDrawer)
 */
export default function Sidebar({ theme, themeKey, setThemeKey, drawerOpen, onCloseDrawer }) {
  const { user, logout } = useAuth()

  return (
    <>
      {/* ── Overlay (mobile only) ─────────────────────────────── */}
      <div
        className={`drawer-overlay${drawerOpen ? ' drawer-overlay--open' : ''}`}
        onClick={onCloseDrawer}
        aria-hidden="true"
      />

      {/* ── Sidebar / drawer ──────────────────────────────────── */}
      <aside
        className={`sidebar${drawerOpen ? ' sidebar--open' : ''}`}
        style={{
          background: theme.page,
          borderRight: `1px solid ${theme.pageInk}10`,
        }}
      >
        {/* ✕ Close button — only rendered on mobile via CSS */}
        <button
          className="sidebar-close"
          onClick={onCloseDrawer}
          aria-label="Cerrar menú"
          style={{
            background: 'transparent',
            border: `1px solid ${theme.pageInk}22`,
            borderRadius: 8,
            color: theme.pageInk,
            width: 32,
            height: 32,
            fontSize: 14,
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Logo */}
        <div
          className="sidebar-top"
          style={{ borderBottom: `1px solid ${theme.pageInk}10` }}
        >
          <div style={{
            fontFamily: FAMILY.display,
            fontWeight: 400,
            fontSize: 28,
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            fontStyle: 'italic',
            color: theme.pageInk,
          }}>
            Prime
          </div>
          <div style={{
            marginTop: 6,
            fontSize: 9,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: 0.45,
            fontWeight: 600,
          }}>
            Nutrición
          </div>
        </div>

        {/* Nav items */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.to}
              item={item}
              theme={theme}
              onNavigate={onCloseDrawer} /* close drawer on nav in mobile */
            />
          ))}
        </nav>

        {/* Theme switcher + user */}
        <div
          className="sidebar-bottom"
          style={{ borderTop: `1px solid ${theme.pageInk}10` }}
        >
          <div style={{
            fontSize: 9,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            opacity: 0.45,
            marginBottom: 10,
            fontWeight: 600,
          }}>
            Paleta
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setThemeKey(key)}
                style={{
                  flex: 1,
                  height: 30,
                  background: key === themeKey ? theme.pageInk : t.page,
                  color: key === themeKey ? theme.page : t.pageInk,
                  border: `1.5px solid ${key === themeKey ? 'transparent' : theme.pageInk + '22'}`,
                  borderRadius: 8,
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
              >
                {t.label.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* User + logout */}
          {user && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${theme.pageInk}10` }}>
              <div style={{
                fontSize: 11, opacity: 0.4, marginBottom: 8,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user.email}
              </div>
              <button
                onClick={logout}
                style={{
                  width: '100%', padding: '7px 0',
                  background: 'transparent',
                  border: `1px solid ${theme.pageInk}18`,
                  borderRadius: 8, color: theme.pageInk,
                  fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  fontFamily: FAMILY.body, cursor: 'pointer',
                  opacity: 0.5, transition: 'opacity .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
