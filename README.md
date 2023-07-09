# Allerta Meteo Liguria

## ⚠️ Extremely Work In Progress ⚠️

Semplice (*proof of concept*) estensione per browser che interfaccia con la pagina ARPAL delle allerte meteo e notifica in tempo reale eventuali aggiornamenti di stato.
L'estensione fornisce un'icona popup che evidenzia il colore con il più alto grado di severità (rosso e, a descrescere, arancione, giallo e verde) rilevato. Quando viene cliccata, apre la pagina ARPAL delle allerte meteo.
Contemporaneamente, una notifica desktop viene visualizzata indicando il colore dell'allerta, con i colori delle rispettive zone.

*Simple (proof of concept) browser extension that interfaces with offical APRAL weather alert service webpage, and notifies any update in real time.
The extension provides an action icon with the color of the most severe (red, and decreasing, orange, yellow, and green) status detected. When clicked, it will open the ARPAL web page.
Also, it provides a desktop notification where the most severe alert is shown, together each zone's alert color.*

To install dependencies:

```bash
bun install
```

To test it into the browser (it will launch **chrome** with temporary dummy user profile and directory):

```bash
bun testing
```

This project was created using `bun init` in bun v0.6.13. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
