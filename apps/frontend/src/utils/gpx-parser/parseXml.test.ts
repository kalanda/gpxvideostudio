import { describe, expect, test } from "vitest";
import { parseXml } from "./parseXml";

describe("parseXml", () => {
  test("parses valid XML and returns a Document", () => {
    const doc = parseXml('<?xml version="1.0"?><root><foo>bar</foo></root>');
    expect(doc.querySelector("foo")?.textContent).toBe("bar");
  });

  test("parses valid GPX fragment", () => {
    const xml = `<gpx><trk><trkpt lat="43.36" lon="-8.41"><ele>100</ele></trkpt></trk></gpx>`;
    const doc = parseXml(xml);
    const pt = doc.querySelector("trkpt");
    expect(pt?.getAttribute("lat")).toBe("43.36");
    expect(pt?.getAttribute("lon")).toBe("-8.41");
    expect(doc.querySelector("ele")?.textContent).toBe("100");
  });

  test("returns Document with correct root for simple XML", () => {
    const doc = parseXml('<?xml version="1.0"?><root></root>');
    expect(doc.documentElement?.localName).toBe("root");
  });
});
