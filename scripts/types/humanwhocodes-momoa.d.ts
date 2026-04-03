/**
 * Minimal typings for @humanwhocodes/momoa (package ships without .d.ts).
 * See https://github.com/humanwhocodes/momoa
 */
declare module "@humanwhocodes/momoa" {
  export type MomoaLocation = {
    start: { line: number; column: number; index: number };
    end: { line: number; column: number; index: number };
  };

  export type MomoaMember = {
    type: "Member";
    name: { value: string; loc: MomoaLocation };
    value: MomoaNode;
  };

  export type MomoaNode =
    | { type: "Document"; body: MomoaNode }
    | { type: "Object"; members: MomoaMember[] }
    | { type: string; [key: string]: unknown };

  export function parse(
    text: string,
    options?: Record<string, unknown>,
  ): MomoaNode;

  export function print(
    node: MomoaNode,
    options?: Record<string, unknown>,
  ): string;
  export function tokenize(
    text: string,
    options?: Record<string, unknown>,
  ): unknown;
  export function traverse(node: MomoaNode, visitor: unknown): void;
  export function evaluate(node: MomoaNode): unknown;
  export const types: Record<string, unknown>;
  export function iterator(node: MomoaNode): unknown;
}
