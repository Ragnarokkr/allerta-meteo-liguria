import { Config, files } from "../libs/build.ts";
import { resolve } from "node:path";
import yaml from "js-yaml";

type LocaleItem = {
  message: string | Array<Record<string, string>>;
  description?: string;
  placeholders?: {
    content: string;
    example?: string;
  };
};

type LocalesDictionary = Map<string, LocaleItem>;

function mapToJSON(_: any, value: any) {
  if (value instanceof Map) {
    return Object.fromEntries(value);
  } else {
    return value;
  }
}

console.log("Building locales...");

for await (const file of files("**/locales.yaml", Config.sourcePath)) {
  const locales: Map<string, LocalesDictionary> = new Map();
  const localesJSON: Record<string, unknown> | unknown = yaml.load(
    await Bun.file(resolve(Config.sourcePath, file)).text()
  );

  if (typeof localesJSON !== "object") continue;

  // build each locale dictionary
  for (const [localeKey, localeItem] of Object.entries(
    localesJSON as Record<string, unknown>
  )) {
    for (const [lang, message] of Object.entries(
      (localeItem as LocaleItem).message
    )) {
      if (!locales.has(lang)) locales.set(lang, new Map());
      locales.get(lang)!.set(localeKey, {
        message: message as string,
        description: (localeItem as LocaleItem).description,
        placeholders: (localeItem as LocaleItem).placeholders,
      });
    }
  }

  // save all locales
  for (const [lang, dict] of locales) {
    const target = resolve(Config.distPath, "_locales", lang, "messages.json");

    try {
      await Bun.write(
        target,
        JSON.stringify(dict, mapToJSON, Config.isProduction ? 0 : 2)
      );
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }
}
