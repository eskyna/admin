# ESKYNA Social Media Studio v0.4.1

Eigenständige Hugo-Seite für den internen Social-Media-Bereich unter:

```text
https://eskyna.com/admin/
```

Version 0.4.1 korrigiert ausdrücklich die zuletzt sichtbaren Deployment-Probleme:

- Das alte **Kampagnen-Board** ist nicht mehr Bestandteil der Templates oder des gerenderten Builds.
- Das **Audio Studio** ist eine echte Hugo-Unterseite unter `https://eskyna.com/admin/audio/`.
- Jede Prompt-Karte besitzt direkt in der Übersicht einen Button **In Zwischenablage kopieren**.

Zusätzlich enthält der Build automatische Prüfungen. GitHub Actions bricht ab, wenn noch altes Kampagnen-Board-Markup vorhanden ist, die Audio-Seite fehlt, `/admin/admin/` erzeugt wird oder das Projekt versehentlich in einem zweiten Ordner `eskyna-admin/` liegt.

## Wichtig: Archiv direkt im Repository-Stamm entpacken

Das v0.4.1-Archiv ist **flach aufgebaut**. Darin liegt kein zusätzlicher Ordner `eskyna-admin/` mehr.

Nach dem Entpacken müssen diese Dateien direkt im Repository-Stamm liegen:

```text
hugo.toml
package.json
layouts/index.html
content/audio/_index.md
.github/workflows/hugo.yml
```

Nicht korrekt wäre:

```text
eskyna-admin/hugo.toml
eskyna-admin/layouts/index.html
```

Falls ein solcher alter Unterordner oder ein alter Build noch existiert, entferne ihn vor dem nächsten Deployment:

```bash
rm -rf eskyna-admin public
rm -f data/campaigns.yaml
```

Der Workflow ist bereits unter `.github/workflows/hugo.yml` enthalten; er muss nicht erneut verschoben werden.

Danach prüfen:

```bash
bash scripts/verify-source.sh
```

Die erwartete Ausgabe lautet:

```text
Source verification passed: root project, no campaign board, audio page and direct prompt copy buttons present.
```

## Enthaltene Bereiche

- Bild- und Brand-Asset-Bibliothek mit Suche, Filtern, Vorschau und Download
- automatisch eingelesene Instagram-Hintergründe
- Prompt Library mit einem direkt sichtbaren Button **In Zwischenablage kopieren** auf jeder Prompt-Karte
- eigenständiges Audio Studio mit Blog- und Instagram-Modus
- Markdown-Dokumente wie `ToneOfVoice.md`, `DesignSystem.md` und `CorporateIdentity.md`
- vorgeschaltete Passwortabfrage mit StatiCrypt

Die mitgelieferten Brand-Dokumente und Demo-Hintergründe sind als Arbeitsentwurf beziehungsweise Starter-Assets gekennzeichnet.

## Lokaler Start

Voraussetzungen: Hugo und Node.js.

```bash
npm install
npm run dev
```

Lokale Hauptseite:

```text
http://localhost:1313/admin/
```

Lokales Audio Studio:

```text
http://localhost:1313/admin/audio/
```

Die Produktions-URL bleibt `https://eskyna.com/admin/`.

Produktions-Build ohne Passwortschutz:

```bash
npm run build
```

Geschützter Build:

```bash
export STATICRYPT_PASSWORD='ein-langes-einzigartiges-team-passwort'
npm run build:protected
```

Der Output liegt direkt in `public/`. Es gibt keinen `public/admin/`-Unterordner und keinen Redirect nach `./admin/`.

## Audio Studio

Die Audio-Oberfläche befindet sich in:

```text
content/audio/_index.md
layouts/audio/list.html
```

Sie wird als eigene Seite gerendert:

```text
public/audio/index.html
```

Im Browser lautet die URL wegen der Basis-URL:

```text
https://eskyna.com/admin/audio/
```

Enthalten sind zwei Modi:

- `blog` für längere, ruhig und erklärend gesprochene Inhalte
- `instagram` für kompakte, dynamischere Voice-overs für Reels und Stories

Der Endpunkt wird später in `hugo.toml` eingetragen:

```toml
[params]
  audioEndpoint = "https://dein-server.example/api/audio/generate"
```

Beim Klick auf **Audio generieren** sendet der Browser:

```json
{
  "mode": "blog",
  "text": "Der zu vertonende Text ...",
  "locale": "de-DE",
  "source": "eskyna-admin"
}
```

Der Client akzeptiert entweder eine direkte Audiodatei oder JSON:

```json
{
  "audioUrl": "https://dein-server.example/audio/eskyna-blog.mp3",
  "filename": "eskyna-blog.mp3"
}
```

Als URL-Felder werden `audioUrl`, `audio_url`, `downloadUrl`, `download_url` und `url` verarbeitet.

Geheime API-Schlüssel gehören ausschließlich auf den Server. Sie dürfen nicht in `hugo.toml`, HTML oder JavaScript eingetragen werden. Bei einer anderen API-Domain muss der Server die passende CORS-Freigabe setzen.

## Instagram-Hintergründe hinzufügen

Neue Dateien kommen in:

```text
assets/backgrounds/instagram/
```

Der Ordner enthält eine `.gitkeep` und bleibt daher auch ohne Bilder im Repository erhalten. Unterstützt werden PNG, JPG/JPEG, WebP, GIF, AVIF, BMP und TIFF.

Beim Build werden passende Bilder automatisch in die Asset-Bibliothek aufgenommen und veröffentlicht unter:

```text
https://eskyna.com/admin/media/backgrounds/instagram/<dateiname>
```

Manuell katalogisierte Dateien liegen weiterhin unter:

```text
static/media/backgrounds/<kategorie>/   # z. B. offen/, leinen/, leder/
static/media/natalia/
static/media/brand/
static/media/templates/
```

Metadaten werden in `data/assets.yaml` gepflegt.

Die vorhandene Demo-Datei ist erreichbar unter:

```text
https://eskyna.com/admin/media/backgrounds/offen/01.png
```

## Prompts und Brand-Dokumente

Jede Prompt-Karte zeigt bereits in der Übersicht den Button **In Zwischenablage kopieren**. Der vollständige Prompt wird kopiert, ohne dass die Karte vorher aufgeklappt werden muss. Nach erfolgreichem Kopieren wechselt die Beschriftung kurz zu **Kopiert** und zusätzlich erscheint eine Statusmeldung.

Prompts liegen in:

```text
data/prompts.yaml
```

Brand-Dokumente liegen in:

```text
content/docs/
```

Die Dokumente werden als eigene, passwortgeschützte Seiten gerendert, z. B.:

```text
https://eskyna.com/admin/docs/ToneOfVoice/
```

Auf der Übersicht und auf der Dokumentseite lässt sich der Link mit **Link kopieren** teilen.

## GitHub Pages Deployment

Der Workflow liegt bereits korrekt unter:

```text
.github/workflows/hugo.yml
```

Er verwendet bewusst die feste Basis-URL:

```text
https://eskyna.com/admin/
```

Damit hängt der Workflow kein zweites `/admin/` an eine dynamisch gelieferte Pages-URL an.

Deployment-Schritte:

1. Dateien direkt in den Repository-Stamm übernehmen.
2. Alte Artefakte mit `rm -rf eskyna-admin public` und `rm -f data/campaigns.yaml` entfernen.
3. `bash scripts/verify-source.sh` ausführen.
4. Unter **Settings -> Secrets and variables -> Actions** das Secret `ADMIN_PASSWORD` mit mindestens 16 Zeichen anlegen.
5. Unter **Settings -> Pages** als Quelle **GitHub Actions** auswählen.
6. Alle Änderungen einschließlich Löschungen committen und auf `main` pushen.

Nach erfolgreichem Deployment ist bereits auf der Passwortseite unten die Kennzeichnung `v0.4.1` sichtbar. Zusätzlich enthält `build-info.json` die verwendete Basis-URL und Build-Version. Fehlt diese Kennzeichnung, läuft noch ein älteres Pages-Artefakt.

Vor dem Build prüft `scripts/verify-source.sh` die Repository-Struktur. Nach dem Hugo-Render prüft `scripts/verify-build.sh` unter anderem:

- `public/index.html` existiert
- `public/audio/index.html` existiert
- beide Audio-Modi sind gerendert
- die direkten Prompt-Kopierbuttons sind gerendert
- das Kampagnen-Board ist nicht enthalten
- `/admin/admin/` kommt nicht vor
- die Demo-Hintergrunddatei ist veröffentlicht

Erst danach werden alle HTML-Seiten rekursiv verschlüsselt. Dadurch sind sowohl `/admin/` als auch `/admin/audio/` passwortgeschützt.

## Passwortschutz und Medien-URLs

Standardmäßig verschlüsselt StatiCrypt alle HTML-Seiten. Die Bilddateien bleiben echte Dateien unter `public/media/`, damit Vorschau, Download und direkte Links funktionieren.

Direkte Bild-URLs werden durch eine clientseitige HTML-Passwortabfrage nicht geschützt. Für einen Build, bei dem referenzierte Medien in die verschlüsselten HTML-Seiten eingebettet und der öffentliche Medienordner entfernt wird:

```bash
EMBED_MEDIA=true npm run build:protected
```

Dann funktionieren direkte Medien-URLs absichtlich nicht mehr.

Für Benutzerkonten, individuelle Berechtigungen, Audit-Logs oder besonders sensible Dateien ist ein serverseitiger Zugriffsschutz beziehungsweise Identity-Proxy erforderlich.

## Projektstruktur

```text
.
|-- .github/workflows/hugo.yml
|-- assets/backgrounds/instagram/
|-- content/audio/_index.md
|-- content/docs/
|-- data/assets.yaml
|-- data/prompts.yaml
|-- layouts/audio/list.html
|-- layouts/index.html
|-- static/css/admin.css
|-- static/js/admin.js
|-- static/media/
|-- scripts/verify-source.sh
|-- scripts/verify-build.sh
|-- scripts/build.sh
|-- scripts/build-protected.sh
|-- scripts/embed-media.mjs
|-- scripts/style-lock-screen.mjs
|-- hugo.toml
`-- package.json
```

## Build-Version prüfen

Nach einem erfolgreichen unverschlüsselten Build steht in:

```text
public/build-info.json
```

unter anderem:

```json
{
  "version": "0.4.1",
  "baseURL": "https://eskyna.com/admin/"
}
```

Im HTML ist zusätzlich ein Meta-Tag `eskyna-build` mit der Version `0.4.1` enthalten.
