import { describe, expect, it } from "vitest";
import { buildExportArtifactBasename } from "./buildExportArtifactBasename";

describe("buildExportArtifactBasename", () => {
  it("concatenates prefix and formatted timestamp", () => {
    const date = new Date(2026, 3, 1, 14, 30, 45);
    expect(buildExportArtifactBasename("telemetry-overlay", date)).toBe(
      "telemetry-overlay-20260401-143045",
    );
  });
});
