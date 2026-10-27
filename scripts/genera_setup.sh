#!/bin/bash
# Riunisce tutte le migrazioni in supabase/setup_completo.sql (da incollare una volta nel SQL Editor di un nuovo progetto).
cd "$(dirname "$0")/.." || exit 1
{
  echo "-- Configurazione completa del database: tutte le migrazioni in ordine, rieseguibili senza errori."
  echo "-- Generato da scripts/genera_setup.sh: per un nuovo progetto basta incollarlo una volta nel SQL Editor."
  for f in supabase/migrations/*.sql; do echo; echo "-- ===== $(basename "$f") ====="; cat "$f"; done
} > supabase/setup_completo.sql
echo "supabase/setup_completo.sql aggiornato"
