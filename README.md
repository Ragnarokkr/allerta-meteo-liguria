# Allerta Meteo Liguria (Chromium Browser Extension)

![Allerta Meteo Liguria Cover](./resources/allerta-meteo-liguria-marquee.png)

Available languages: [it](README-it.md)

Simple Chromium browser extension that interfaces with the Liguria Civil Protection website and notifies of any updates to weather alert statuses.

> The project stems from the desire to experiment with different development approaches using unconventional tools and libraries. Consequently, it is possible that it will undergo structural changes in the future.

## Features

- **Popup icon**:
  - Image with weather alert color;
  - Tooltip with last update date and weather alert severity.
- **Popup**:
  - Map of Liguria with alert colors;
  - Last update date and weather alert severity, information on possible risks;
  - Links to Civil Protection and ARPA Liguria websites;
  - Links to alert bulletins and forecasts.
- **Desktop notification**:
  - Weather alert severity;
  - Further information on possible risks;
  - Links to Civil Protection and ARPA Liguria websites.
- **Options**:
  - Customization of links to Civil Protection and ARPA Liguria websites (in case they are updated before the extension receives a new update);
  - Time interval for checking for updates.

## Permissions

The extension requires the following permissions to function properly:

- `alarms`: to be able to periodically check for updates on the website;
- `notifications`: to be able to display desktop notifications;
- `offscreen`: necessary to be able to load the Civil Protection page in the background from which to retrieve the necessary information;
- `storage`: to save the extension's options.

## Development

The extension and build scripts source code is written in [TypeScript](https://www.typescriptlang.org/). The development environment requires that [Bun](https://bun.sh/) be installed on the system.

### Clone the repository

```bash
> git clone https://github.com/Ragnarokkr/allerta-meteo-liguria.git
```

### Install [Bun](https://bun.sh/) according to your operating system

In the documentation on the official website you can find all the information you need to [install](https://bun.sh/) Bun for your operating system.

### Available tasks

- `clean`: removes the destination directory and built zipped file;
- `dev`: creates the extension, ready to be loaded unpacked in the browser;
- `build`: creates the extension, optimized and minified, ready to be zipped and uploaded online;
- `generate:js`: packages (and minifies) TypeScript sources;
- `generate:css`: optimizes (and minifies) style sheets;
- `generate:html`: optimizes (and minifies) HTML files;
- `generate:md`: converts to HTML (and minifies) MarkDown files;
- `generate:locales`: generates (and minifies) supported language files;
- `generate:svg`: generates (optimized) icons used in the extension from SVG files;
- `generate:images`: copies (and optimizes) images used in the extension;
- `generate:manifest`: generates the extension manifest file;
- `generate:copy`: copies the files that do not need further processing (texts, fonts, etc.)
- `validate:sources`: verifies that all files follow the style rules and do not present errors;
- `bump`: increments the version number of the package and manifest;
- `pack`: creates the extension .zip file;
- `publish`: publishes/updates the extension on the store.

For the `dev` and `build` tasks, the execution order of all sub-tasks is always: `clean` and `validate:sources` in series, and all `generate:*` in parallel.

The `NODE_ENV` environment variable can be set to `develop` (or not set) or `production` to enable optimization and minification. By default it is set only for the `build` task.

For the `bump` task, you can specify the version part to be incremented with the `RELEASE` environment variable set to `major`, `minor`, or `patch` (by default the `patch` version will be incremented).

## Project structure

```plaintext
.
├── build
├── dist
├── chrome
├── resources
└── various configuration files...
```

- `build`: directory of scripts for compiling the code;
- `dist`: directory for builds;
- `chrome`: directory of source files used for the extension;
- `resources`: directory of files for images to use in the web store;

## Configuration

Build settings are configured in [`build.config.ts`](build.config.ts), where you can specify the various directories, sizes and colors of the icons, and other parameters related to compilation, minification and optimization.

The `build.config.ts` configuration file is imported into the various task files and exports a default object structured as follows:

```TypeScript
export default {
  isProduction: boolean, // is it a production or development build?
  basePath: string, // the base directory of the project
  sourcePath: string, // the directory of the source files
  distPath: string, // the directory of the build destination
  transpile: Record<string, unknown>, // options for compiling TypeScript
  css: Record<string, unknown>, // options for optimizing CSS
  html: Record<string, unknown>, // options for optimizing HTML
  svg: Record<string, unknown>, // options for generating SVG icons
  images: Record<string, unknown>, // options for optimizing images
  manifest: Record<string, unknown>, // configuration of the manifest file
};
```

## Technical Notes and Known Limitations

- Due to the nature of the data acquisition procedure (scraping) from the Civil Protection website, it is necessary to keep in mind that any future changes to the HTML code of the page itself may invalidate the information obtained, making it necessary to update the extension code.
- Since the data acquisition takes place directly from the web page, it is not currently possible to provide different language versions of the alert messages obtained from the site.
