/**
 * PRIME · Nutrición — Supabase data layer
 * Todas las operaciones de DB pasan por aquí.
 * Los componentes nunca importan supabase directamente.
 */
import { supabase } from './supabase'

// ── Helpers de fecha ─────────────────────────────────────────────────────────

/** 'YYYY-MM-DD' en hora local del usuario */
function localToday() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

/** Rango ISO del día local actual (para filtrar logged_at) */
function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { from: start.toISOString(), to: end.toISOString() }
}

/** Diferencia en días entre una fecha ISO y hoy (negativa = pasado) */
function daysDiff(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return Math.round((d - today) / 864e5)
}

/** 'HH:MM' a partir de un timestamp ISO */
function toHHMM(iso) {
  return new Date(iso).toTimeString().slice(0, 5)
}

// ── PROFILES ─────────────────────────────────────────────────────────────────

/**
 * Obtiene el perfil completo del usuario.
 * Devuelve null si no existe o si onboarding_completado = false.
 */
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // PGRST116 = 0 rows (no existe todavía)
  if (error && error.code !== 'PGRST116') throw error
  if (!data || !data.onboarding_completado) return null
  return data
}

/**
 * Guarda / actualiza el perfil después del onboarding.
 * Hace UPSERT en caso de que el trigger ya haya creado la fila vacía.
 */
export async function upsertProfile(userId, form) {
  const payload = {
    id:                    userId,
    nombre:                form.nombre                || null,
    edad:                  parseInt(form.edad)        || null,
    sexo:                  form.sexo                  || null,
    altura_cm:             parseFloat(form.altura)    || null,
    peso_inicial_kg:       parseFloat(form.pesoActual)    || null,
    peso_objetivo_kg:      parseFloat(form.pesoObjetivo)  || null,
    objetivo:              form.objetivo              || null,
    comidas_dia:           form.comidasDia            || null,
    agua_habito:           form.agua                  || null,
    actividad_fisica:      form.actividad             || null,
    alimento_ansiedad:     form.ansiedad              || null,
    horario_comida:        form.horarioComida         || null,
    habitos_positivos:     form.habitosPositivos      || null,
    habitos_cambiar:       form.habitosCambiar        || null,
    alimento_favorito:     form.alimentoFavorito      || null,
    onboarding_completado: true,
  }
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Actualiza campos del perfil desde la página Perfil/Configuración.
 * Recibe los campos con sus nombres de columna reales (no el mapeo del onboarding).
 * Usa UPDATE (no UPSERT) porque el perfil siempre existe en este punto.
 */
export async function updateProfileSettings(userId, settings) {
  const { data, error } = await supabase
    .from('profiles')
    .update(settings)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── MEALS ────────────────────────────────────────────────────────────────────

/** Comidas del día actual del usuario, ordenadas cronológicamente */
export async function fetchTodayMeals(userId) {
  const { from, to } = todayRange()
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', from)
    .lt('logged_at', to)
    .order('logged_at', { ascending: true })
  if (error) throw error
  return (data || []).map(rowToMeal)
}

/** Inserta una comida y devuelve el objeto con UUID real */
export async function insertMeal(userId, meal) {
  const { data, error } = await supabase
    .from('meals')
    .insert({
      user_id:     userId,
      nombre:      meal.name,
      momento:     meal.tag  || 'snack',
      kcal:        Number(meal.kcal)    || 0,
      proteina_g:  Number(meal.protein) || 0,
      carbos_g:    Number(meal.carbs)   || 0,
      grasa_g:     Number(meal.fat)     || 0,
      foto_url:    meal.photo           || null,
      ai_estimado: true,
      logged_at:   new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return rowToMeal(data)
}

export async function deleteMeal(id) {
  const { error } = await supabase.from('meals').delete().eq('id', id)
  if (error) throw error
}

function rowToMeal(r) {
  return {
    id:      r.id,
    time:    toHHMM(r.logged_at),
    name:    r.nombre,
    kcal:    Number(r.kcal)       || 0,
    protein: Number(r.proteina_g) || 0,
    carbs:   Number(r.carbos_g)   || 0,
    fat:     Number(r.grasa_g)    || 0,
    photo:   r.foto_url           || null,
    tag:     r.momento,
  }
}

// ── WEIGHT ───────────────────────────────────────────────────────────────────

/** Historial de peso (últimos 30 registros) → formato { day, kg } */
export async function fetchWeightHistory(userId) {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('fecha, peso_kg')
    .eq('user_id', userId)
    .order('fecha', { ascending: true })
    .limit(30)
  if (error) throw error
  return (data || []).map(r => ({
    day: daysDiff(r.fecha),
    kg:  parseFloat(r.peso_kg),
  }))
}

/** Upsert: un peso por día */
export async function upsertWeight(userId, kg) {
  const { error } = await supabase
    .from('weight_logs')
    .upsert(
      { user_id: userId, fecha: localToday(), peso_kg: kg },
      { onConflict: 'user_id,fecha' },
    )
  if (error) throw error
}

// ── WATER ────────────────────────────────────────────────────────────────────

/** Total de litros bebidos hoy */
export async function fetchTodayWater(userId) {
  const { data, error } = await supabase
    .from('water_logs')
    .select('litros')
    .eq('user_id', userId)
    .eq('fecha', localToday())
  if (error) throw error
  return (data || []).reduce((sum, r) => sum + parseFloat(r.litros), 0)
}

/** Registra un incremento de agua */
export async function insertWater(userId, litros) {
  const { error } = await supabase
    .from('water_logs')
    .insert({ user_id: userId, litros, fecha: localToday() })
  if (error) throw error
}

// ── EXERCISE ─────────────────────────────────────────────────────────────────

/** Ejercicios del día actual */
export async function fetchTodayExercises(userId) {
  const { from, to } = todayRange()
  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', from)
    .lt('logged_at', to)
    .order('logged_at', { ascending: true })
  if (error) throw error
  return (data || []).map(rowToExercise)
}

/** Inserta un ejercicio y devuelve el objeto con UUID real */
export async function insertExercise(userId, exercise) {
  const durMin = parseInt(String(exercise.duration)) || 0
  const { data, error } = await supabase
    .from('exercise_logs')
    .insert({
      user_id:        userId,
      nombre:         exercise.name,
      duracion_min:   durMin,
      kcal_estimadas: Number(exercise.kcal) || 0,
      ai_estimado:    true,
      logged_at:      new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return rowToExercise(data)
}

export async function deleteExercise(id) {
  const { error } = await supabase.from('exercise_logs').delete().eq('id', id)
  if (error) throw error
}

function rowToExercise(r) {
  return {
    id:       r.id,
    time:     toHHMM(r.logged_at),
    name:     r.nombre,
    duration: r.duracion_min ? `${r.duracion_min} min` : '—',
    kcal:     Number(r.kcal_estimadas) || 0,
  }
}

// ── WEEK CALORIES ─────────────────────────────────────────────────────────────

/**
 * Calorías de los últimos 7 días (índice 0 = hace 6 días, índice 6 = hoy).
 * El componente WeekCard siempre overridea el último índice con el live `consumed`.
 */
export async function fetchWeekCalories(userId) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('meals')
    .select('logged_at, kcal')
    .eq('user_id', userId)
    .gte('logged_at', sevenDaysAgo.toISOString())
  if (error) throw error

  const daily = Array(7).fill(0)
  for (const meal of data || []) {
    const d = new Date(meal.logged_at)
    d.setHours(0, 0, 0, 0)
    const idx = Math.round((d - sevenDaysAgo) / 864e5)
    if (idx >= 0 && idx < 7) daily[idx] += Number(meal.kcal) || 0
  }
  return daily
}
