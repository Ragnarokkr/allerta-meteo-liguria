export function message(str: string, replaceLine = false) {
  // ASCII escape character
  const ESC = "\x1b";
  // control sequence introducer
  const CSI = ESC + "[";

  if (replaceLine) {
    Deno.writeSync(Deno.stdout.rid, new TextEncoder().encode(CSI + "A")); // moves cursor up one line
    Deno.writeSync(Deno.stdout.rid, new TextEncoder().encode(CSI + "K")); // clears from cursor to line end
  }

  console.info(str);
}
