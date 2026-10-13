import fs from "node:fs";
const css = fs.readFileSync("src/app/tokens.css", "utf8");
const palettes = JSON.parse(
  fs.readFileSync("src/lib/design/palette.json", "utf8"),
);
for (const [mode, colors] of Object.entries(palettes)) {
  const block =
    mode === "light" ? css.split(".dark")[0] : css.split(".dark")[1];
  for (const [name, value] of Object.entries(colors))
    if (!block.includes("--" + name + ": " + value + ";"))
      throw new Error(mode + " token mismatch: " + name);
}
console.log("Theme colors match the canonical design palette.");
