import { describe, expect, it } from "vitest";
import { extractUsedKeys } from "./extractUsedKeys";

describe("extractUsedKeys", () => {
  it("should extract translation keys from the content", () => {
    const content = `t('test')`;
    const usedKeys = new Set<string>();
    extractUsedKeys(content, usedKeys);
    expect(usedKeys).toEqual(new Set(["test"]));
  });

  it("should extract translation keys from the content with t and values", () => {
    const content = `
      label={t('test',
        { consentName },
      )}
    `;
    const usedKeys = new Set<string>();
    extractUsedKeys(content, usedKeys);
    expect(usedKeys).toEqual(new Set(["test"]));
  });

  it("should extract translation keys from the content with t and values", () => {
    const content = `
      label={t('test',
        { consentName }
      )}
    `;
    const usedKeys = new Set<string>();
    extractUsedKeys(content, usedKeys);
    expect(usedKeys).toEqual(new Set(["test"]));
  });

  it("should extract translation keys from the content with i18nKey", () => {
    const content = `
      <Trans
        i18nKey="explanationScreen.addresInfo"
      />'
      `;
    const usedKeys = new Set<string>();
    extractUsedKeys(content, usedKeys);
    expect(usedKeys).toEqual(new Set(["explanationScreen.addresInfo"]));
  });

  it("should extract translation keys from the content with t and values", () => {
    const content = `
      <Trans
        i18nKey="explanationScreen.addresInfo"
        values={{
          address,
        }}
      />'
      `;
    const usedKeys = new Set<string>();
    extractUsedKeys(content, usedKeys);
    expect(usedKeys).toEqual(new Set(["explanationScreen.addresInfo"]));
  });

  it("should extract translation keys from the content with t and values", () => {
    const content = `
      <Trans
        i18nKey="explanationScreen.addresInfo"
        values={
        { address }}
      />'
      `;
    const usedKeys = new Set<string>();
    extractUsedKeys(content, usedKeys);
    expect(usedKeys).toEqual(new Set(["explanationScreen.addresInfo"]));
  });
});
