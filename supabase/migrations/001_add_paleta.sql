-- ================================================================
-- Migration 001: agregar columna paleta a profiles
-- ================================================================
-- Ejecutar en: Supabase → SQL Editor → New query → Run (F5)
-- Es idempotente: "IF NOT EXISTS" evita error si ya existe.
-- ================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS paleta TEXT DEFAULT 'obsidian'
    CHECK (paleta IN ('obsidian', 'earth', 'cool', 'desert'));

COMMENT ON COLUMN public.profiles.paleta IS
  'Paleta visual seleccionada por el usuario. Valores: obsidian | earth | cool | desert';

-- Verificación rápida:
-- SELECT id, nombre, paleta FROM public.profiles LIMIT 5;
