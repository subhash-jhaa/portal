import { describe, it, expect } from "vitest";
import { palettes } from "../src/lib/design/tokens";
import { gross, deductions, net } from "../src/lib/design/fixtures";
function luminance(hex: string) {
  const channels = [1, 3, 5]
    .map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
describe("design data and text contrast", () => {
  it("keeps the salary statement arithmetically consistent", () => {
    expect(gross).toBe(75000);
    expect(deductions).toBe(10000);
    expect(net).toBe(65000);
  });
  for (const [mode, colors] of Object.entries(palettes)) {
    for (const [surface, foreground] of [
      ["background", "foreground"],
      ["card", "card-foreground"],
      ["primary", "primary-foreground"],
      ["muted", "muted-foreground"],
      ["accent", "accent-foreground"],
    ] as const) {
      it(mode + " " + foreground + " meets 4.5:1 contrast", () => {
        const values = [
          luminance(colors[surface]),
          luminance(colors[foreground]),
        ].sort((a, b) => b - a);
        expect((values[0] + 0.05) / (values[1] + 0.05)).toBeGreaterThanOrEqual(
          4.5,
        );
      });
    }
  }
});
