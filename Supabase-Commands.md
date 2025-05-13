# Supabase Essentials
Hilfs-Scripts sind in [package.json](./package.json) zu sehen.

**Lokale Entwicklung starten:**
- Zuerst Podman Machine starten
- `npm run supabase-local`
- `npm run dev`

App: http://localhost:3000 \
Supabase Studio (lokal): http://localhost:54323

**Konfiguration anpassen** (z.B. auth oder seeds): \
`supabase/config.toml` bearbeiten.

**Datenbankschema bearbeiten:** \
Über die lokale Supabase Studio UI. \
Alternativ direkt über migration files (`supabase migration new <migration-name>`) => Flexibler

Weitere Details zum Thema Migrations/Seeding bitte in den Docs nachlesen: https://supabase.com/docs/guides/deployment/database-migrations

Lokale Seeds können mit Snaplet generiert werden: https://supabase.com/docs/guides/local-development/seeding-your-database#generating-seed-data

**Datenbank resetten und Testdaten anlegen**
supabase db reset && npm run gen-seeds

**Mit Remote-Instanz verbinden:** \
`supabase login` und dann `supabase link`

**DB pushen:** \
`supabase db push`

**Edge-Function zum Remote-Projekt deployen**: \
`supabase functions deploy your-function-name`

**config.toml pushen:** \
`supabase config push`
