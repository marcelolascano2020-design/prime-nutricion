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

/**
 * Sube un blob URL (URL.createObjectURL) a Supabase Storage.
 * Devuelve el path en el bucket: '{userId}/{timestamp}.ext'
 */
async function uploadMealPhoto(userId, blobUrl) {
  const resp = await fetch(blobUrl)
  const blob = await resp.blob()
  const ext  = blob.type.includes('png')
    ? 'png'
    : blob.type.includes('webp') ? 'webp' : 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('meals-photos')
    .upload(path, blob, { contentType: blob.type, upsert: false })
  if (error) throw error
  console.log('[uploadMealPhoto] subido al path:', path)
  return path
}

/**
 * Convierte storage paths a signed URLs (24 h).
 * Si ya es http/blob, lo deja tal cual.
 */
async function addSignedPhotoUrls(meals) {
  if (!meals.length) return meals
  return Promise.all(meals.map(async meal => {
    if (
      !meal.photo ||
      meal.photo.startsWith('http') ||
      meal.photo.startsWith('blob:')
    ) return meal

    const { data, error } = await supabase.storage
      .from('meals-photos')
      .createSignedUrl(meal.photo, 60 * 60 * 24) // 24 h

    if (error) console.error('[addSignedPhotoUrls] meal', meal.id, error.message)
    console.log(
      '[addSignedPhotoUrls] meal', meal.id,
      '→', data?.signedUrl ? 'OK (signed URL)' : 'FALLO (null)',
    )
    return { ...meal, photo: data?.signedUrl ?? null }
  }))
}

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
  const meals = (data || []).map(rowToMeal)
  console.log(
    '[fetchTodayMeals] foto_urls crudos:',
    meals.map(m => ({ id: m.id, photo: m.photo })),
  )
  return addSignedPhotoUrls(meals)
}

/**
 * Inserta una comida.
 * Si meal.photo es un blob URL, lo sube a Storage primero.
 * Devuelve el objeto con el blob URL original para display inmediato
 * (tras reload, fetchTodayMeals devuelve la signed URL desde Storage).
 */
export async function insertMeal(userId, meal) {
  const originalPhoto = meal.photo || null   // blob URL para display en sesión actual

  // ── Subir foto si viene como blob URL ─────────────────────────
  let fotoPath = null
  if (meal.photo && meal.photo.startsWith('blob:')) {
    try {
      fotoPath = await uploadMealPhoto(userId, meal.photo)
    } catch (e) {
      console.error('[insertMeal] upload de foto falló, se guarda sin foto:', e.message)
    }
  } else if (meal.photo) {
    fotoPath = meal.photo   // ya es un path o URL directa
  }

  console.log('[insertMeal] foto_url que se guarda en DB:', fotoPath)

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
      foto_url:    fotoPath,
      ai_estimado: true,
      logged_at:   new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error

  // Devolver con blob URL para que se vea inmediatamente sin esperar signed URL
  return { ...rowToMeal(data), photo: originalPhoto }
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

/** Igual que rowToMeal pero agrega campo `date` ('YYYY-MM-DD' local) */
function rowToMealWithDate(r) {
  const d = new Date(r.logged_at)
  const date = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
  return { ...rowToMeal(r), date }
}

/**
 * Todas las comidas de un mes (year/month en tiempo local del usuario).
 * Devuelve los registros con el campo `date` ('YYYY-MM-DD') adicional.
 */
export async function fetchMonthMeals(userId, year, month) {
  const start = new Date(year, month, 1, 0, 0, 0, 0)
  const end   = new Date(year, month + 1, 1, 0, 0, 0, 0)

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', start.toISOString())
    .lt('logged_at', end.toISOString())
    .order('logged_at', { ascending: true })
  if (error) throw error
  const meals = (data || []).map(rowToMealWithDate)
  return addSignedPhotoUrls(meals)
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
