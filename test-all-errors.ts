import type { ValidatePattern } from "./index";

function processQuery<const T extends readonly unknown[]>(
  query: T & ValidatePattern<T>
): void {
  console.log("Processing query:", query);
}

// Test 1: Sequential queries (should error) - no 'as const' needed!
processQuery([{ name: "John" }, { age: 30 }]);

// Test 2: Sequential operators (should error)
processQuery([{ name: "John" }, "AND", "OR", { age: 30 }]);

// Test 3: Ends with operator (should error)
processQuery([{ name: "John" }, "AND"]);

// Test 4: Starts with operator (should error)
processQuery(["AND", { name: "John" }]);

// Test 5: Valid query (should work)
processQuery([{ name: "John" }, "AND", { age: 30 }]);
