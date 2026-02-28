import { DOMParser } from "linkedom";

/**
 * Parse XML string to Document using linkedom (same parser in app and tests).
 * Throws if the XML is invalid.
 */
export function parseXml(xmlString: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(
    xmlString,
    "text/xml",
  ) as unknown as Document;

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error(`Invalid GPX XML: ${parseError.textContent}`);
  }

  return doc;
}
