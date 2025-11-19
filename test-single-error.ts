import type { ValidatePattern } from "./index";

function processQuery<T extends readonly unknown[]>(
  query: T & ValidatePattern<T>
): void {
  console.log("Processing query:", query);
}

// This should cause a type error - wrong operator
processQuery([
  { name: "John" },
  "NAND",
  { age: 30 }
] as const);
