import type { ValidatePattern } from "./index";

function processQuery<T extends readonly unknown[]>(
  query: T & ValidatePattern<T>
): void {
  console.log("Processing query:", query);
}

// Test 1: Sequential queries (should error)
processQuery([{ name: "John" }, { age: 30 }] as const);

// Test 2: Sequential operators (should error)
processQuery([{ name: "John" }, "AND", "OR", { age: 30 }] as const);

// Test 3: Ends with operator (should error)
processQuery([{ name: "John" }, "AND"] as const);

// Test 4: Starts with operator (should error)
processQuery(["AND", { name: "John" }] as const);

// Test 5: Valid query (should work)
processQuery([{ name: "John" }, "AND", { age: 30 }] as const);
