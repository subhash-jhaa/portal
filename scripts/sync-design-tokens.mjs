import fs from "node:fs";
const palettes = JSON.parse(
  fs.readFileSync("src/lib/design/palette.json", "utf8"),
);
const css =
  "/* Generated from lib/design/palette.json. Run npm run sync:tokens after changes. */\n" +
  Object.entries(palettes)
    .map(
      ([mode, tokens]) =>
        (mode === "light" ? ":root" : ".dark") +
        " {\n  color-scheme: " +
        mode +
        ";\n" +
        Object.entries(tokens)
          .map(([key, value]) => "  --" + key + ": " + value + ";")
          .join("\n") +
        "\n  --radius: 0.75rem;\n}\n",
    )
    .join("\n");
fs.writeFileSync("src/app/tokens.css", css);
