import type { ValidatePattern } from "./index";

function processQuery<const T extends readonly unknown[]>(
  query: T & ValidatePattern<T>
): void {
  console.log("Processing query:", query);
}

// This should cause a type error - wrong operator (no 'as const' needed!)
processQuery([
  { name: "John" },
  "NAND",
  { age: 30 }
]);
