# Allerta Meteo Liguria (Estensione per browser basati su Chromium)

![Allerta Meteo Liguria Cover](./resources/allerta-meteo-liguria-marquee.png)

Altre lingue disponibili: [en](README.md)

Semplice estensione per browser basati su Chromium che si interfaccia con il sito della Protezione Civile della Liguria e notifica eventuali aggiornamenti di stato relativi alle allerte meteo.

> Il progetto nasce dal desiderio di sperimentare diverse modalità di sviluppo con strumenti e librerie inusuali. Conseguentemente, è possibile che subisca modifiche strutturali in futuro.

## Funzionalità

- **Icona popup**:
  - immagine con colore dell'allerta meteo;
  - tooltip con data ultimo aggiornamento e severità allerta meteo.
- **Popup**:
  - cartina della Liguria nelle colorazioni delle allerte;
  - data ultimo aggiornamento e severità allerta meteo, informazioni sui possibili rischi;
  - collegamenti a siti della Protezione Civile e di ARPA Liguria;
  - collegamenti a bollettini allerte e previsioni.
- **Notifica desktop**:
  - severità dell'allerta meteo;
  - ulteriori informazioni sui possibili rischi;
  - collegamenti ai siti della Protezione Civile e di ARPA Liguria.
- **Opzioni**:
  - personalizzazione dei collegamenti ai siti di Protezione Civile e ARPA Liguria (in caso venissero aggiornati prima che l'estensione riceva un nuovo aggiornamento);
  - intervallo di tempo per il controllo degli aggiornamenti.

## Permessi

L'estensione necessita dei seguenti permessi per poter funzionare correttamente:

- `alarms`: per poter controllare periodicamente gli aggiornamenti sul sito;
- `notifications`: per poter mostrare le notifiche desktop;
- `offscreen`: necessario per poter caricare in background la pagina della Protezione Civile dalla quale recuperare le informazioni necessarie;
- `storage`: per registrare le opzioni dell'estensione.

## Sviluppo

Il codice sorgente dell'estensione e degli script di build è scritto in [TypeScript](https://www.typescriptlang.org/). L'ambiente di sviluppo richiede che sia installato [Bun](https://bun.sh/) nel sistema.

### Clona il repository

```bash
> git clone https://github.com/Ragnarokkr/allerta-meteo-liguria.git
```

### Installa [Bun](https://bun.sh/) in base al tuo sistema operativo

Nella documentazione sul sito ufficiale puoi trovare tutte le informazioni necessarie ad [installare](https://bun.sh/) Bun per il tuo sistema operativo.

### Task a disposizione

- `clean`: rimuove la directory di destinazione e l'eventuale file .zip dell'estensione;
- `dev`: crea l'estensione, pronta per essere caricata non pacchettizzata nel browser;
- `build`: crea l'estensione, ottimizzata e minificata, pronta per essere zippata e caricata online;
- `generate:js`: pacchettizza (e minifica) i sorgenti in TypeScript;
- `generate:css`: ottimizza (e minifica) i fogli di stile;
- `generate:html`: ottimizza (e minifica) i file HTML;
- `generate:md`: converte in HTML (e minifica) i file MarkDown;
- `generate:locales`: genera (e minifica) i file delle lingue supportate;
- `generate:svg`: genera dai file SVG le icone (ottimizzate) usate nell'estensione;
- `generate:images`: copia (e ottimizza) le immagini usate nell'estensione;
- `generate:manifest`: genera il file manifest dell'estensione;
- `generate:copy`: copia i file che non necessitano di ulteriore processazione (testi, fonts, ecc.)
- `validate:sources`: verifica che tutti i file seguano le regole di stile e non presentino errori;
- `bump`: incrementa il numero di versione del package e del manifest;
- `pack`: crea il file .zip dell'estensione;
- `publish`: pubblica/aggiorna l'estensione sullo store.

Per i task `dev` e `build`, l'ordine di esecuzione di tutti i sotto-task è sempre: `clean` e `validate:sources` in serie, e tutti i `generate:*` in parallelo.

È possibile impostare la variabile `NODE_ENV` su `develop` (o non impostare) o `production` per abilitare ottimizzazioni e minificazioni. Di default è impostata solo per il task `build`.

Per il task `bump` è possibile specificare la parte di versione da incrementare con la variabile ambiente `RELEASE` impostata su `major`, `minor`, o `patch` (di default verrà incrementata la versione `patch`).

## Struttura del progetto

```plaintext
.
├── build
├── dist
├── chrome
├── resources
└── file vari di configurazione...
```

- `build`: directory degli script per la compilazione del codice;
- `dist`: directory per le build;
- `chrome`: directory dei file sorgenti utilizzati per l'estensione;
- `resources`: directory dei file per le immagini da usare nel web store;

## Configurazione

Le impostazioni per il build vengono configurate in [`build.config.ts`](build.config.ts), dove è possibile specificare le varie directory, dimensioni e colori delle icone, ed altri parametri inerenti compilazione, minificazione ed ottimizzazione.

Il file di configurazione `build.config.ts` viene importato nei vari file di task ed esporta un oggetto di default così strutturato:

```typescript
export default {
  isProduction: boolean, // è una build di produzione o di sviluppo?
  basePath: string, // la directory del progetto
  sourcePath: string, // la directory dei sorgenti
  distPath: string, // la directory di destinazione
  transpile: Record<string, unknown>, // opzioni per la compilazione in TS
  css: Record<string, unknown>, // opzioni per l'ottimizzazione dei CSS
  html: Record<string, unknown>, // opzioni per l'ottimizzazione dei HTML
  svg: Record<string, unknown>, // opzioni per la creazione delle icone da SVG
  images: Record<string, unknown>, // opzioni per l'ottimizzazione delle immagini
  manifest: Record<string, unknown>, // configurazione del manifest
};
```

## Note tecniche e limitazioni conosciute

- Data la natura della procedura di acquisizione dei dati (_scraping_) dal sito web della Protezione Civile, è necessario tenere a mente che ogni futura modifica al codice HTML della pagina stessa può invalidare le informazioni ottenute, rendendo necessario aggiornare il codice dell'estensione.
- Dato che l'acquisizione dei dati avviene direttamente dalla pagina web, non è al momento possibile fornire versioni in lingue differenti dei messaggi di allerta ottenuti dal sito.
