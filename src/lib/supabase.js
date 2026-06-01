import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[PRIME] Faltan variables de entorno de Supabase.\n' +
    'Asegurate de definir VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY\n' +
    'en Vercel → Settings → Environment Variables (o en el archivo .env local).'
  )
}

// Usamos placeholders para evitar que createClient tire un error a nivel de módulo
// cuando las variables no están definidas (e.g. en Vercel sin env vars).
// Sin las vars reales la conexión fallará, pero React podrá montar y mostrar un error legible.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
)

export async function getTodayWater(userId) {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('water_logs')
    .select('litros')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()
  if (error) throw error
  return data?.litros ?? 0
}

export async function saveWaterLog(userId, liters) {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('water_logs')
    .upsert({ user_id: userId, date: today, litros: liters }, { onConflict: 'user_id,date' })
    .select()
    .single()
  if (error) throw error
  return data
}
