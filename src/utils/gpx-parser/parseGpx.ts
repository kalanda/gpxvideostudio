import type {
  GpxFile,
  GpxMetadata,
  GpxTrack,
  GpxTrackPoint,
} from "@/types/gpx";
import { parseXml } from "./parseXml";

/**
 * Parse a GPX XML string into a structured GpxFile object.
 *
 * @param gpxString The raw GPX XML string
 */
export function parseGpx(gpxString: string): GpxFile {
  const doc = parseXml(gpxString);
  const metadata = parseMetadata(doc);
  const tracks = parseTracks(doc);

  return { metadata, tracks };
}

function parseMetadata(doc: Document): GpxMetadata {
  const metadataEl = doc.querySelector("metadata");

  return {
    name: getTextContent(metadataEl, "name"),
    description: getTextContent(metadataEl, "description"),
    author: getTextContent(metadataEl, "author > name"),
    time: getDateContent(metadataEl, "time"),
  };
}

function parseTracks(doc: Document): GpxTrack[] {
  const trackEls = doc.querySelectorAll("trk");
  const tracks: GpxTrack[] = [];

  for (const trackEl of trackEls) {
    const name = getTextContent(trackEl, "name");
    const points = parseTrackPoints(trackEl);
    tracks.push({ name, points });
  }

  return tracks;
}

function parseTrackPoints(trackEl: Element): GpxTrackPoint[] {
  const pointEls = trackEl.querySelectorAll("trkpt");
  const points: GpxTrackPoint[] = [];

  for (const ptEl of pointEls) {
    const lat = Number.parseFloat(ptEl.getAttribute("lat") ?? "");
    const lon = Number.parseFloat(ptEl.getAttribute("lon") ?? "");

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      continue;
    }

    points.push({
      lat,
      lon,
      ele: getFloatContent(ptEl, "ele"),
      time: getDateContent(ptEl, "time"),
      hr: getExtensionValue(ptEl, "hr"),
      cad: getExtensionValue(ptEl, "cad"),
      power: getExtensionValue(ptEl, "power"),
      temp: getExtensionValue(ptEl, "atemp"),
    });
  }

  return points;
}

/**
 * Extract a numeric value from GPX extensions.
 * Searches common extension namespaces (gpxtpx, ns3, etc.)
 * Handles both namespaced (gpxtpx:hr) and non-namespaced (hr) tags.
 *
 * Uses recursive childNodes traversal for cross-environment compatibility
 * (DOMParser in browsers and linkedom in tests handle getElementsByTagName differently).
 */
function getExtensionValue(ptEl: Element, fieldName: string): number | null {
  const extensionsEl = ptEl.querySelector("extensions");
  if (!extensionsEl) return null;

  return findValueInChildren(extensionsEl, fieldName);
}

function findValueInChildren(
  parent: Element,
  fieldName: string,
): number | null {
  for (let i = 0; i < parent.childNodes.length; i++) {
    const node = parent.childNodes[i];
    if (node.nodeType !== 1) continue; // Only element nodes

    const el = node as Element;
    const nodeName = el.nodeName || "";
    const localName = nodeName.includes(":")
      ? nodeName.split(":").pop()
      : nodeName;

    if (localName === fieldName && el.textContent) {
      const value = Number.parseFloat(el.textContent);
      if (!Number.isNaN(value)) return value;
    }

    // Recurse into child elements (e.g., TrackPointExtension wrapper)
    const childResult = findValueInChildren(el, fieldName);
    if (childResult !== null) return childResult;
  }

  return null;
}

function getTextContent(
  parent: Element | null,
  selector: string,
): string | null {
  if (!parent) return null;
  const el = parent.querySelector(selector);
  return el?.textContent?.trim() ?? null;
}

function getFloatContent(
  parent: Element | null,
  selector: string,
): number | null {
  const text = getTextContent(parent, selector);
  if (text === null) return null;
  const value = Number.parseFloat(text);
  return Number.isNaN(value) ? null : value;
}

function getDateContent(parent: Element | null, selector: string): Date | null {
  const text = getTextContent(parent, selector);
  if (text === null) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}
