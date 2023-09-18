# Allerta Meteo Liguria (Chrome Extension)

![Allerta Meteo Liguria Cover](./extension/resources/cover.svg)

Other languages available: [it](README.it.md)

Simple extension for Chromium-based browsers that interfaces with the Liguria Civil Protection website and notifies you of any status updates relating to weather alerts in real time.

## Features

* Colored popup icon accordingingly to the weather alert and tooltip with last update date and weather alert severity;
* Popup with map of Liguria in the colors of the alerts, and links to:
  * Civil Protection and ARPA Liguria websites;
  * bulletins alerts and forecasts;
* Desktop notification with weather alert severity, further information on possible risks, and links to the Civil Protection and ARPA Liguria sites.
* Options for customizing (or possibly correcting) the links to the Civil Protection and ARPA Liguria sites, and the time interval for checking for updates.

## Permissions

The extension requires following permissions to work as expected:

* `notifications`: to show desktop notifications;
* `offscreen`: required to load the Civil Protection webpage in the background from which to retrieve the necessary information. (This is what makes the extension to require at least Chrome v109+);
* `storage`: to store extension options.

## Installing

The extension code is plain JavaScript (ES6), but the development environment requires [Deno](https://deno.land/) installed into the system. Building tasks also require [Skia](https://skia.org/) and [Puppeteer](https://pptr.dev/), which will be installed at the first build run.

### Clone the repository

```bash
> git clone https://github.com/Ragnarokkr/allerta-meteo-liguria.git
```

### Install [Deno](https://deno.land/manual/getting_started/installation) accordingly to your operating system

From the documentation on the official website it's possible to find the [installation](https://deno.land/manual/getting_started/installation) instructions for your operating system.

### Available tasks

```bash
> deno task
  Available tasks:
  - build:clean
  - build:bump
  - build:debug
  - build:release
  - test:chrome
  - test:chrome:dry-run
  - test:chrome:debug
  - test:chrome:release
  - publish:package
  - tools:collector
```

* `build:clean`: remove temporary cache and build directories;
* `build:bump`: increment the version (can increment major, minor, or patch) in manifest and changelog;
* `build:debug`: build the debug version of the extension;
* `build:release`: build the release version of extension, stripped of comments and log sections;
* `test:chrome`: run an instance of **chrome** with a temporary user profile in the cache folder, with all extensions disabled, except the debug build;
* `test:chrome:dry-run`: initialize cache folder and temporary user profile without starting instance of **chrome**;
* `test:chrome:debug`: create the debug build and start the **chrome** instance using it as an extension;
* `test:chrome:release`: create the release build and start the **chrome** instance using it as an extension;
* `publish:package`: create the release build, create the graphics to upload on the web store, and create the .zip file
* `tools:collector`: starts a web scraping tool that collects messages strings from the website. (Used to collect strings for future alerts localizations).

For `build:*` tasks, it is possibile to declare `PRODUCTION=debug` (default) or `PRODUCTION=release`, and `FLAGS=[clean,icons,covers,copy,manifest,locales,license,changelog,verbose]` environment variables to pass to the build. The flags can be specified with a leading `--no-` to disable the specific flag. (Read [build.ts](build/build.ts) for more info about the default flags.)

For `build:bump` task, it is possible to specify the version part to bump with `RELEASE=[major|minor|patch]` environment variable. (By default it will bump the patch version.)

For `test:chrome:*` tasks, it is possible to declare `PRODUCTION=debug` (default) or `PRODUCTION=release`, and `FLAGS=[dry-run]` environment variables to specify which target and action to perform.

For `tools:*` tasks, it is possible to declare the `FLAGS` environment variable to specify options. (Read the specific tool's code for more info.)

## Project Structure

```text
.
├── .cache
│  └── chrome-test-dir
├── build
├── dist
│  ├── debug
│  ├── release
│  ├── allerta-meteo-liguria-marquee.png
│  ├── allerta-meteo-liguria-small.png
│  └── allerta-meteo-liguria.zip
├── extension
│  ├── resources
│  │  ├── cover.svg
│  │  ├── icon.svg
│  │  └── locales.yaml
│  ├── src
│  └── manifest.yaml
├── tools
├── .editorconfig
├── .gitignore
├── .prettierrc
├── deno.json
├── deno.lock
├── LICENSE
├── README.it.md
├── README.md
└── tsconfig.json
```

* `.cache`: temporary directory for creating builds;
   * `chrome-test-dir`: temporary profile directory for the **chrome** instance;
* `build`: script directory for building tasks;
* `dist`: directory for debug and release builds;
   * `debug`: extension debug build directory;
   * `release`: extension release build directory;
   * `*.png`: .png files are generated during the build process from the `cover.svg` file;
   * `*.zip`: the .zip file is created during the release build task;
* `extension`: all the files required for the build process are into this directory;
   * `resources`: directory of resources shared by builds;
     * `cover.svg`: vector file of the cover to be uploaded to the web store
     * `icon.svg`: vector file of the icon used for the extension on the web store and into the browser;
     * `locales.yaml`: localization file [yaml](https://yaml.org/), used to create files in the various supported languages
   * `src`: extension sources directory
   * `manifest.yaml`: [yaml](https://yaml.org/) file with settings to be used to create the `manifest.json` files required by the extension;
* `tools`: all the tools used for developing the extension and its related files, are stored here
* `.editorconfig`: configuration file for [EditorConfig](https://editorconfig.org/)
* `.gitignore`: git file for excluding files/directories
* `.prettierrc`: [Prettier](https://prettier.io/) configuration file
* `deno.json`: configuration file for **Deno** and tasks
* `tsconfig.json`: configuration file for TypeScript.

## Configuration

Most build settings can be configured via the [`config_build.ts`](build/config_build.ts) file located under the `build` directory.

Inside the file it's possibile to configure the various directories, the size and color of the icons, and which files to ignore during the release build.

The instantiated class returns an object with this structure:

```typescript
{
  manifest: { [key:string]: unknown },
  changelog: { [key:string]: unknown },
  extensionDir: string,
  resourcesDir: string,
  sourceDir: string,
  buildDir: string,
  iconsDir: string,
  popupIconSizes: number[],
  iconSizes: number[],
  promoSizes: { 
    [key:string]: {
      width:number, 
      height:number
    } 
  },
  popupIconColors: { [key:string]: string },
  excludedFiles: string[],

  getDistFiles(options?: DistFilesOptions): string[]
}
```

## Technical notes and known limitations

* Due to the nature of the data acquisition procedure (*scraping*) from the Civil Protection website, it is necessary to bear in mind that any future modification to the HTML code of the page itself may invalidate the information obtained, making it necessary to update the code of the extension.
* Since the data acquisition takes place directly from the web page, it is not currently possible to provide different language versions of the alert messages obtained from the site.