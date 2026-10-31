# ERP Weihnachtsmarkt

Ein kleines ERP- und Verwaltungsprojekt für einen Weihnachtsmarkt mit Frontend und Backend.

## Struktur

- `backend/` – Express API
- `frontend/` – React + Vite UI

## Schnellstart

### Supabase-Projekt konfigurieren

1. Im Supabase-Projekt `supabase/schema.sql` im SQL Editor ausführen.
2. Unter Authentication → URL Configuration die Site URL auf `https://leon9171.github.io/erp-weihnachtsmarkt/` setzen und diese Redirect-URLs ergänzen:
   - `https://leon9171.github.io/erp-weihnachtsmarkt/**`
   - `http://localhost:5174/**`
3. `frontend/.env.local` mit der Projekt-URL und dem Publishable Key aus den API-Einstellungen einrichten:
   ```env
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
   ```
4. Im Supabase-Dashboard unter Authentication die Teamkonten einladen. Beim ersten Öffnen des Einladungslinks legt jedes Teammitglied ein eigenes Passwort fest.
5. Teammitglieder in `public.erp_members` freischalten. Für jede eingeladene Adresse im SQL Editor ausführen:
   ```sql
   insert into public.erp_members (user_id, email)
   select id, email
   from auth.users
   where lower(email) = lower('teammitglied@example.com')
   on conflict (user_id) do nothing;
   ```
6. Für GitHub Pages die GitHub-Repository-Variablen `SUPABASE_URL` und `SUPABASE_PUBLISHABLE_KEY` setzen, damit der Workflow die Supabase-Konfiguration beim Build einbindet.

Die Anwendung verlangt eine Supabase-Anmeldung. Nur Mitglieder in `erp_members` erhalten über Row Level Security Zugriff auf den gemeinsamen ERP-Datenbestand. Der erste berechtigte Browser übernimmt vorhandene lokale Daten, wenn noch kein gemeinsamer Datenbestand angelegt wurde.

1. Backend installieren:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Frontend installieren:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Frontend im Browser öffnen:
   ```text
   http://localhost:5174/erp-weihnachtsmarkt/
   ```

4. API prüfen:
   ```text
   http://localhost:4000/api/health
   ```

## Standardfunktionen

- Dashboard mit Kennzahlen
- Produktübersicht
- Bestellverwaltung
- Bestellungen auf einer eigenen Seite löschen; Artikel, Toppings und Ausgaben direkt in ihren Listen entfernen
- Lager-/Bestandsübersicht
- Kundenverwaltung
