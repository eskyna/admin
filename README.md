# ESKYNA Social Media Studio

Eigenständige Hugo-Seite für den internen Social-Media-Bereich. Der Build wird unter `/admin/` ausgegeben und enthält:

- eine Bild- und Brand-Asset-Bibliothek mit Suche, Filtern, Vorschau und Download
- eine sofort kopierbare Prompt Library
- Markdown-Dokumente wie `ToneOfVoice.md`, `DesignSystem.md` und `CorporateIdentity.md`
- ein vorbereitetes Kampagnen-Board für den nächsten Ausbauschritt
- eine vorgeschaltete Passwortabfrage mit StatiCrypt
- einen geschützten Produktions-Build, der registrierte Medien in die verschlüsselte HTML-Datei einbettet

Die mitgelieferten Brand-Dokumente und Demo-Hintergründe sind als Arbeitsentwurf beziehungsweise Starter-Assets gekennzeichnet.

## Schnellstart lokal

Voraussetzungen: Hugo sowie Node.js. Der GitHub-Workflow ist auf Hugo `0.164.0` und Node.js `24.18.0` festgelegt.

```bash
npm install
npm run dev
```

Die unverschlüsselte Entwicklungsansicht ist danach unter `http://localhost:1313/admin/` erreichbar.

Produktions-Build ohne Passwortschutz:

```bash
npm run build
```

Geschützter lokaler Build:

```bash
export STATICRYPT_PASSWORD='ein-langes-einzigartiges-team-passwort'
npm run build:protected
```

Der fertige Output liegt in `public/`, die eigentliche Anwendung in `public/admin/`.

## Inhalte pflegen

### Neue Bilder oder Dateien

1. Datei in einen passenden Ordner unter `static/media/` legen:

```text
static/media/backgrounds/
static/media/natalia/
static/media/brand/
static/media/templates/
static/media/campaigns/
```

2. Einen Eintrag in `data/assets.yaml` ergänzen. Dieser steuert Titel, Kategorie, Tags, Abmessungen, Nutzungszweck, Rechte und Vorschau.

```yaml
- id: "natalia-portrait-white"
  title: "Natalia Portrait White"
  category: "natalia"
  category_label: "Natalia"
  file: "media/natalia/natalia-portrait-white.png"
  filename: "natalia-portrait-white.png"
  format: "PNG transparent"
  dimensions: "1600 x 2200"
  ratio: "8:11"
  usage: "Feed, Story, Kampagne"
  rights: "ESKYNA intern"
  source: "Fotoshooting 2026"
  updated: "20.07.2026"
  description: "Freigestelltes Portrait mit weißem Outfit."
  tags: ["natalia", "portrait", "transparent"]
  fit: "contain"
```

Nur registrierte Dateien werden in den geschützten Produktions-Build eingebettet. Nicht referenzierte Dateien werden beim Build gemeldet und nicht deployed.

### Prompts

Prompts liegen in `data/prompts.yaml`. Variablen sind bewusst als Klartext-Platzhalter angelegt, damit der komplette Prompt ohne zusätzliche Logik kopiert werden kann.

### Brand-Dokumente

Markdown-Dateien liegen unter `content/docs/`. Neue Dokumente benötigen im Front Matter:

```yaml
build:
  render: never
  list: always
```

Dadurch erscheinen sie im geschützten Single-Page-Workspace, werden aber nicht als separate unverschlüsselte HTML-Seiten ausgegeben.

## GitHub Pages Deployment

1. Repository zu GitHub pushen. Reale interne Assets dürfen nicht in einem öffentlichen Repository liegen. Für GitHub Pages aus einem privaten Repository wird ein passender kostenpflichtiger GitHub-Plan benötigt.
2. Unter **Settings -> Secrets and variables -> Actions** das Repository Secret anlegen:

```text
Name: ADMIN_PASSWORD
Value: ein langes, einzigartiges Passwort mit mindestens 16 Zeichen
```

3. Unter **Settings -> Pages** als Source **GitHub Actions** auswählen.
4. Auf `main` pushen oder den Workflow manuell starten.

Der Workflow baut Hugo nach `public/admin/`, bettet die registrierten Medien in `index.html` ein, entfernt den öffentlichen `media/`-Ordner, verschlüsselt die HTML-Datei und deployed `public/`. Die Pages-Root leitet anschließend auf `/admin/` weiter.

## Passwortschutz und Sicherheitsmodell

GitHub Pages ist statisches Hosting und stellt keine serverseitige Anmeldung bereit. StatiCrypt verschlüsselt die HTML-Datei und entschlüsselt sie nach erfolgreicher Passworteingabe im Browser.

Wichtig: Ein privates Quell-Repository macht die veröffentlichte Pages-Site nicht automatisch privat. GitHub-eigene Zugriffskontrolle für eine privat veröffentlichte Pages-Site setzt eine Organisation mit GitHub Enterprise Cloud voraus. Ohne diese Funktion ist die URL öffentlich erreichbar und der Schutz dieses Starters beruht auf der clientseitig verschlüsselten StatiCrypt-Datei.

Im Standard-Build dieses Starters werden die registrierten Dateien unter `static/media/` vor der Verschlüsselung als Data-URLs in die HTML-Datei eingebettet. Der erzeugte öffentliche `media/`-Ordner wird entfernt. Damit liegen auch die eingebetteten Bilder im verschlüsselten Inhalt und sind nicht mehr über separate Asset-URLs abrufbar.

Wichtige Grenzen:

- Das Quell-Repository und seine Git-Historie enthalten weiterhin die Originaldateien; das Repository sollte privat bleiben.
- Ein statisch verschlüsselter Build kann offline gegen Passwörter getestet werden. Deshalb eine lange, einzigartige Passphrase verwenden und bei Teamwechsel rotieren.
- Das Einbetten ist für Bilder, PDFs und kleine Dateien gedacht. Einzeldateien über 25 MB brechen den Build standardmäßig ab; große Videos gehören in einen echten zugriffsgeschützten Speicher.
- Für Benutzerkonten, individuelle Sperrung, Audit-Logs oder hochsensible Daten ist ein Identity- und Access-Management wie Cloudflare Access oder eine serverseitige Anwendung erforderlich.

Der Button **Studio sperren** setzt den StatiCrypt-Logout und lädt die Passwortseite neu. Die Option zum Merken des Passworts ist auf 14 Tage eingestellt.

Das Einbetten kann für einen Test-Build deaktiviert werden:

```bash
EMBED_MEDIA=false npm run build:protected
```

## `/admin` unter eskyna.com

Das Projekt erzeugt den Pfad `/admin/` innerhalb seines eigenen GitHub-Pages-Deployments. Eine separate Pages-Site kann nicht automatisch einen Unterordner einer bereits anderswo gehosteten Website übernehmen.

Für `https://eskyna.com/admin/` gibt es drei Integrationswege:

1. den erzeugten Ordner `public/admin/` in den bestehenden ESKYNA-Website-Deploy aufnehmen
2. `eskyna.com/admin/` über einen Reverse Proxy auf die Pages-Site routen
3. den internen Bereich auf eine eigene Subdomain wie `studio.eskyna.com` legen

Für einen dauerhaft internen Arbeitsbereich ist eine eigene Subdomain mit echtem Zugriffsschutz die belastbarste Variante.

## Projektstruktur

```text
.
|-- .github/workflows/hugo.yml
|-- content/docs/              # Markdown-Wissensbasis
|-- data/assets.yaml           # Asset-Katalog
|-- data/prompts.yaml          # Prompt Library
|-- layouts/                   # Hugo Templates
|-- static/css/admin.css
|-- static/js/admin.js
|-- static/media/              # Quelldateien
|-- scripts/build.sh
|-- scripts/build-protected.sh
|-- scripts/embed-media.mjs    # bettet Assets vor der Verschlüsselung ein
|-- scripts/style-lock-screen.mjs # ESKYNA-Theme für die Passwortseite
|-- hugo.toml
`-- package.json
```

## Design-Hinweis

Die Tone-of-Voice-, CI- und Design-System-Inhalte sind klar als Arbeitsentwurf markiert. Sie orientieren sich an der derzeit sichtbaren ESKYNA-Markenwirkung und sollten vor verbindlicher Nutzung intern fachlich freigegeben werden.
