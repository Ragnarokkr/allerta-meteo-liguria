/**
 * Converts a string to title case.
 *
 * @param {TemplateStringsArray} strings - The array of strings to be combined.
 * @param {...unknown[]} values - The values to be inserted into the strings.
 * @return {string} The resulting string in title case.
 */
export function titleCase(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return strings.reduce((acc, str, i) => {
    let value = values[i - 1];
    if (value !== null && typeof value !== "undefined") {
      value = value.toString();
      acc +=
        (value as string).charAt(0).toUpperCase() +
        (value as string).slice(1).toLowerCase();
    }
    acc += str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    return acc;
  }, "");
}

/**
 * Converts a string to sentence case.
 *
 * @param {TemplateStringsArray} strings - The array of strings to be combined.
 * @param {...unknown[]} values - The values to be inserted into the strings.
 * @return {string} The resulting string in sentence case.
 */
export function sentenceCase(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return strings
    .reduce((acc, str, i) => {
      let value = values[i - 1];
      if (value !== null && typeof value !== "undefined") {
        value = value.toString();
        acc += value + "";
      }
      if (i === 0) {
        acc += str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      } else {
        acc += str.toLowerCase();
      }
      return acc;
    }, "")
    .trim();
}
