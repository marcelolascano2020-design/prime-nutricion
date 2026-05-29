-- ================================================================
-- PRIME · Nutrición — Supabase Schema
-- Ejecutar completo en: SQL Editor → New query → Run (F5)
-- ================================================================


-- ── 0. Extensiones ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ================================================================
-- TABLAS
-- ================================================================

-- ── 1. PROFILES ─────────────────────────────────────────────────
--    Extiende auth.users. Se crea automáticamente con el trigger.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Datos personales (Onboarding paso 1)
  nombre                TEXT,
  edad                  SMALLINT        CHECK (edad BETWEEN 10 AND 120),
  sexo                  CHAR(1)         CHECK (sexo IN ('M', 'F')),

  -- Cuerpo (Onboarding paso 2)
  altura_cm             NUMERIC(5,1),
  peso_inicial_kg       NUMERIC(5,2),
  peso_objetivo_kg      NUMERIC(5,2),
  objetivo              TEXT            CHECK (objetivo IN ('lose', 'maintain', 'gain')),

  -- Hábitos (Onboarding paso 3)
  comidas_dia           TEXT,
  agua_habito           TEXT,
  actividad_fisica      TEXT,
  alimento_ansiedad     TEXT,
  horario_comida        TEXT,

  -- Metas cualitativas (Onboarding paso 4)
  habitos_positivos     TEXT,
  habitos_cambiar       TEXT,
  alimento_favorito     TEXT,

  -- Configuración de la app
  agua_meta_litros      NUMERIC(4,2)    DEFAULT 2.0,
  calorias_meta         INTEGER         DEFAULT 2200,
  paleta                TEXT            DEFAULT 'obsidian'
                                          CHECK (paleta IN ('obsidian','earth','cool','desert')),
  onboarding_completado BOOLEAN         DEFAULT FALSE,

  created_at            TIMESTAMPTZ     DEFAULT NOW(),
  updated_at            TIMESTAMPTZ     DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfil extendido del usuario. 1:1 con auth.users.';


-- ── 2. MEALS ────────────────────────────────────────────────────
--    Registro de comidas con macros y foto opcional.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE public.meals (
  id           UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  logged_at    TIMESTAMPTZ  DEFAULT NOW(),
  momento      TEXT         NOT NULL,
    -- 'desayuno' | 'almuerzo' | 'cena' | 'merienda' | 'colación' | 'snack'

  nombre       TEXT         NOT NULL,
  descripcion  TEXT,

  kcal         NUMERIC(7,1) DEFAULT 0 CHECK (kcal >= 0),
  proteina_g   NUMERIC(6,1) DEFAULT 0 CHECK (proteina_g >= 0),
  carbos_g     NUMERIC(6,1) DEFAULT 0 CHECK (carbos_g >= 0),
  grasa_g      NUMERIC(6,1) DEFAULT 0 CHECK (grasa_g >= 0),

  foto_url     TEXT,                   -- path en bucket 'meals-photos'
  ai_estimado  BOOLEAN      DEFAULT FALSE,

  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

COMMENT ON TABLE public.meals IS 'Registro de comidas diarias con macros estimados.';
COMMENT ON COLUMN public.meals.foto_url IS 'Path en bucket meals-photos: {user_id}/{uuid}.jpg';


-- ── 3. WEIGHT_LOGS ──────────────────────────────────────────────
--    Un registro por día por usuario (UNIQUE user_id + fecha).
-- ────────────────────────────────────────────────────────────────
CREATE TABLE public.weight_logs (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  fecha      DATE        NOT NULL DEFAULT CURRENT_DATE,
  peso_kg    NUMERIC(5,2) NOT NULL CHECK (peso_kg > 0),
  nota       TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, fecha)   -- evita duplicados por día
);

COMMENT ON TABLE public.weight_logs IS 'Historial de peso corporal. Máximo un registro por día.';


-- ── 4. WATER_LOGS ───────────────────────────────────────────────
--    Cada fila = un incremento (0.25 / 0.5 / 1.0 L).
--    Sumar por fecha para el total del día.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE public.water_logs (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  fecha      DATE        NOT NULL DEFAULT CURRENT_DATE,
  litros     NUMERIC(4,2) NOT NULL CHECK (litros > 0 AND litros <= 5),

  logged_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.water_logs IS 'Ingresos de agua. Sumar litros por fecha para el total diario.';


-- ── 5. EXERCISE_LOGS ────────────────────────────────────────────
--    Actividad física diaria con duración y calorías estimadas.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE public.exercise_logs (
  id              UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  logged_at       TIMESTAMPTZ  DEFAULT NOW(),
  nombre          TEXT         NOT NULL,
  duracion_min    INTEGER      DEFAULT 0 CHECK (duracion_min >= 0),
  kcal_estimadas  NUMERIC(6,1) DEFAULT 0 CHECK (kcal_estimadas >= 0),
  tipo            TEXT,
    -- 'cardio' | 'fuerza' | 'flexibilidad' | 'deporte' | null

  ai_estimado     BOOLEAN      DEFAULT FALSE,
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);

COMMENT ON TABLE public.exercise_logs IS 'Registro de actividad física diaria.';


-- ── 6. PROGRESS_PHOTOS ──────────────────────────────────────────
--    Galería de fotos del físico para el comparador A vs. B.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE public.progress_photos (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  foto_url   TEXT        NOT NULL,     -- path en bucket 'progress-photos'
  fecha      DATE        NOT NULL DEFAULT CURRENT_DATE,
  peso_kg    NUMERIC(5,2),             -- peso del día (opcional)
  nota       TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.progress_photos IS 'Galería de fotos de progreso físico. Path en bucket progress-photos.';


-- ================================================================
-- ÍNDICES DE PERFORMANCE
-- ================================================================

CREATE INDEX meals_user_logged_idx    ON public.meals(user_id, logged_at DESC);
CREATE INDEX weight_user_fecha_idx    ON public.weight_logs(user_id, fecha DESC);
CREATE INDEX water_user_fecha_idx     ON public.water_logs(user_id, fecha DESC);
CREATE INDEX exercise_user_logged_idx ON public.exercise_logs(user_id, logged_at DESC);
CREATE INDEX photos_user_fecha_idx    ON public.progress_photos(user_id, fecha DESC);


-- ================================================================
-- FUNCIONES Y TRIGGERS
-- ================================================================

-- ── updated_at automático en profiles ───────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── Auto-crear profile al registrarse un nuevo usuario ──────────
--    Lee full_name del metadata que Register.jsx envía al hacer signUp.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;


-- ── profiles ────────────────────────────────────────────────────
CREATE POLICY "profiles_select"  ON public.profiles FOR SELECT  USING     (id = auth.uid());
CREATE POLICY "profiles_insert"  ON public.profiles FOR INSERT  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update"  ON public.profiles FOR UPDATE  USING     (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_delete"  ON public.profiles FOR DELETE  USING     (id = auth.uid());

-- ── meals ────────────────────────────────────────────────────────
CREATE POLICY "meals_select"  ON public.meals FOR SELECT  USING     (user_id = auth.uid());
CREATE POLICY "meals_insert"  ON public.meals FOR INSERT  WITH CHECK (user_id = auth.uid());
CREATE POLICY "meals_update"  ON public.meals FOR UPDATE  USING     (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "meals_delete"  ON public.meals FOR DELETE  USING     (user_id = auth.uid());

-- ── weight_logs ──────────────────────────────────────────────────
CREATE POLICY "weight_select" ON public.weight_logs FOR SELECT  USING     (user_id = auth.uid());
CREATE POLICY "weight_insert" ON public.weight_logs FOR INSERT  WITH CHECK (user_id = auth.uid());
CREATE POLICY "weight_update" ON public.weight_logs FOR UPDATE  USING     (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "weight_delete" ON public.weight_logs FOR DELETE  USING     (user_id = auth.uid());

-- ── water_logs ───────────────────────────────────────────────────
CREATE POLICY "water_select"  ON public.water_logs FOR SELECT  USING     (user_id = auth.uid());
CREATE POLICY "water_insert"  ON public.water_logs FOR INSERT  WITH CHECK (user_id = auth.uid());
CREATE POLICY "water_update"  ON public.water_logs FOR UPDATE  USING     (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "water_delete"  ON public.water_logs FOR DELETE  USING     (user_id = auth.uid());

-- ── exercise_logs ────────────────────────────────────────────────
CREATE POLICY "exercise_select" ON public.exercise_logs FOR SELECT  USING     (user_id = auth.uid());
CREATE POLICY "exercise_insert" ON public.exercise_logs FOR INSERT  WITH CHECK (user_id = auth.uid());
CREATE POLICY "exercise_update" ON public.exercise_logs FOR UPDATE  USING     (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "exercise_delete" ON public.exercise_logs FOR DELETE  USING     (user_id = auth.uid());

-- ── progress_photos ──────────────────────────────────────────────
CREATE POLICY "photos_select" ON public.progress_photos FOR SELECT  USING     (user_id = auth.uid());
CREATE POLICY "photos_insert" ON public.progress_photos FOR INSERT  WITH CHECK (user_id = auth.uid());
CREATE POLICY "photos_update" ON public.progress_photos FOR UPDATE  USING     (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "photos_delete" ON public.progress_photos FOR DELETE  USING     (user_id = auth.uid());


-- ================================================================
-- STORAGE BUCKETS
-- ================================================================
--
-- Convención de paths:  {user_id}/{uuid}.jpg
-- Los buckets son privados (public = false).
-- Las URLs se obtienen con supabase.storage.from('bucket').createSignedUrl(path, 3600)
--
-- ────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'meals-photos',
    'meals-photos',
    false,
    10485760,   -- 10 MB por foto
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  ),
  (
    'progress-photos',
    'progress-photos',
    false,
    20971520,   -- 20 MB por foto
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  )
ON CONFLICT (id) DO NOTHING;


-- ── Storage RLS: meals-photos ────────────────────────────────────
CREATE POLICY "meals_photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'meals-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "meals_photos_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'meals-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "meals_photos_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'meals-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "meals_photos_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'meals-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ── Storage RLS: progress-photos ─────────────────────────────────
CREATE POLICY "progress_photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "progress_photos_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "progress_photos_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "progress_photos_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ================================================================
-- FIN DEL SCHEMA
-- ================================================================
-- Verificación rápida post-ejecución:
--
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
--
--   SELECT bucket_id, name, public FROM storage.objects LIMIT 0;  -- confirma buckets
--   SELECT id FROM public.profiles LIMIT 1;                       -- confirma trigger
-- ================================================================
