import { processQuery } from "./index";

// Test 1: Invalid nested query - ends with operator
processQuery([
  [{ name: "John" }, "AND"],  // Invalid nested query
  "OR",
  { age: 30 }
]);

// Test 2: Invalid nested query - starts with operator
processQuery([
  ["AND", { name: "John" }],  // Invalid nested query
  "OR",
  { age: 30 }
]);

// Test 3: Invalid nested query - sequential queries
processQuery([
  [{ name: "John" }, { name: "Jane" }],  // Invalid nested query
  "AND",
  { age: 30 }
]);

// Test 4: Valid deeply nested query
processQuery([
  { status: "active" },
  "AND",
  [
    { name: "John" },
    "OR",
    [{ age: 30 }, "AND", { role: "admin" }]  // Valid deep nesting
  ]
]);
