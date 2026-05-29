export const FAMILY = {
  display: "'DM Serif Display', 'Cormorant Garamond', serif",
  body: "'Familjen Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
}

export const THEMES = {
  obsidian: {
    label: 'Obsidiana',
    page: '#0c0d0a',
    pageInk: '#e8dcb8',
    accent: '#d4a85a',
    tiles: {
      hero:     { bg: '#15140f', ink: '#e8dcb8', accent: '#d4a85a' },
      weight:   { bg: '#1c1a14', ink: '#e8dcb8', accent: '#d4a85a' },
      photo:    { bg: '#1c1a14', ink: '#e8dcb8', accent: '#d4a85a' },
      macros:   { bg: '#18170f', ink: '#e8dcb8', accent: '#d4a85a' },
      exercise: { bg: '#1c1a14', ink: '#e8dcb8', accent: '#d4a85a' },
      log:      { bg: '#15140f', ink: '#e8dcb8', accent: '#d4a85a' },
      week:     { bg: '#18170f', ink: '#e8dcb8', accent: '#d4a85a' },
      water:    { bg: '#141820', ink: '#e8dcb8', accent: '#82c8e8' },
    },
  },
  earth: {
    label: 'Tierra',
    page: '#e8dec4',
    pageInk: '#2a1f10',
    accent: '#c25e3c',
    tiles: {
      hero:     { bg: '#5e6b34', ink: '#f3ead4', accent: '#e8c862' },
      weight:   { bg: '#c25e3c', ink: '#fbf2e0', accent: '#fbf2e0' },
      photo:    { bg: '#f0e6cc', ink: '#2a1f10', accent: '#c25e3c' },
      macros:   { bg: '#d4bd87', ink: '#2a1f10', accent: '#5e6b34' },
      exercise: { bg: '#1f3a3e', ink: '#f3ead4', accent: '#e8c862' },
      log:      { bg: '#faf2dd', ink: '#2a1f10', accent: '#c25e3c' },
      week:     { bg: '#3a1f3a', ink: '#f3ead4', accent: '#e8c862' },
      water:    { bg: '#345a7a', ink: '#d4eef8', accent: '#82c8e8' },
    },
  },
  cool: {
    label: 'Fría',
    page: '#dde2dd',
    pageInk: '#1a2226',
    accent: '#3a5a4a',
    tiles: {
      hero:     { bg: '#1a2e4a', ink: '#eef2f6', accent: '#9cc4e6' },
      weight:   { bg: '#7a8b6a', ink: '#f4f7ed', accent: '#f4f7ed' },
      photo:    { bg: '#e8ece4', ink: '#1a2226', accent: '#3a5a4a' },
      macros:   { bg: '#a8b8a4', ink: '#1a2226', accent: '#3a5a4a' },
      exercise: { bg: '#2a3e3e', ink: '#e8ece4', accent: '#c2dccc' },
      log:      { bg: '#f2f4ee', ink: '#1a2226', accent: '#3a5a4a' },
      week:     { bg: '#3a2e4a', ink: '#eef2f6', accent: '#c2dccc' },
      water:    { bg: '#1a3a5a', ink: '#cce4f8', accent: '#72b8e8' },
    },
  },
  desert: {
    label: 'Desierto',
    page: '#f4e8d4',
    pageInk: '#2e1a14',
    accent: '#a83e26',
    tiles: {
      hero:     { bg: '#a83e26', ink: '#fbf2e0', accent: '#f4c862' },
      weight:   { bg: '#3a2218', ink: '#f4c862', accent: '#f4c862' },
      photo:    { bg: '#ecd9b0', ink: '#2e1a14', accent: '#a83e26' },
      macros:   { bg: '#e8a85a', ink: '#2e1a14', accent: '#a83e26' },
      exercise: { bg: '#5e3a2a', ink: '#f4c862', accent: '#f4c862' },
      log:      { bg: '#fdf2dc', ink: '#2e1a14', accent: '#a83e26' },
      week:     { bg: '#7a2a2a', ink: '#f4c862', accent: '#f4c862' },
      water:    { bg: '#1e3a52', ink: '#c8def4', accent: '#6ab0dc' },
    },
  },
}

export function fmtNum(n) {
  return Math.round(n).toLocaleString('es-MX')
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

export function nowHHMM() {
  const d = new Date()
  return pad(d.getHours()) + ':' + pad(d.getMinutes())
}

export function todayLabel() {
  const d = new Date()
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const wk = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  return `${wk[d.getDay()]} · ${d.getDate()} ${months[d.getMonth()]}`
}
