import { useState, useEffect } from 'react'
import { FAMILY } from '../theme'
import WaterCard from '../components/WaterCard'
import { useAuth } from '../context/AuthContext'
import { getTodayWater, saveWaterLog } from '../lib/supabase'

const GOAL = 2.0

export default function Agua({ theme }) {
  const { user } = useAuth()
  const [liters, setLiters]   = useState(0)
  const [saved, setSaved]     = useState(true)   // true = sin cambios pendientes
  const [saving, setSaving]   = useState(false)
  const [loading, setLoading] = useState(true)

  // Cargar dato del día al montar
  useEffect(() => {
    if (!user) return
    setLoading(true)
    getTodayWater(user.id)
      .then(l => { setLiters(l); setSaved(true) })
      .catch(e => console.error('[Agua] load error:', e))
      .finally(() => setLoading(false))
  }, [user])

  function handleAdd(amt) {
    setLiters(l => Math.max(0, Math.min(GOAL + 2, +(l + amt).toFixed(2))))
    setSaved(false)
  }

  async function handleSave() {
    if (!user || saving) return
    setSaving(true)
    try {
      await saveWaterLog(user.id, liters)
      setSaved(true)
    } catch (e) {
      console.error('[Agua] save error:', e)
    } finally {
      setSaving(false)
    }
  }

  const accent    = theme.tiles.water?.bg ?? theme.accent
  const drawerInk = theme.pageInk

  return (
    <div style={{ minHeight: '100vh', padding: '40px 40px 120px', fontFamily: FAMILY.body }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
            Módulo · Fase 1
          </div>
          <div style={{ fontFamily: FAMILY.display, fontWeight: 400, fontSize: 52, lineHeight: 0.92, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
            Hidratación
          </div>
          <div style={{ marginTop: 14, fontSize: 14, opacity: 0.55, lineHeight: 1.6, maxWidth: 520 }}>
            Seguimiento de ingesta de agua diaria con objetivo configurable en el perfil.
          </div>
        </div>

        {loading ? (
          <div style={{ fontSize: 14, opacity: 0.4 }}>Cargando…</div>
        ) : (
          <div style={{ maxWidth: 380 }}>
            <WaterCard
              palette={theme.tiles.water}
              liters={liters}
              goal={GOAL}
              onAdd={handleAdd}
            />

            {/* Botón Guardar */}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14 }}>
              {saved && (
                <span style={{ fontSize: 11, opacity: 0.45, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  ✓ Guardado
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saved || saving}
                style={{
                  background: saved ? 'transparent' : accent,
                  color: saved ? drawerInk : '#0E0F0C',
                  border: `1px solid ${saved ? drawerInk + '33' : accent}`,
                  padding: '12px 28px',
                  fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                  fontWeight: 700, cursor: saved ? 'default' : 'pointer',
                  borderRadius: 999, fontFamily: 'inherit',
                  opacity: saved ? 0.35 : 1,
                  transition: 'all .2s ease',
                }}
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
