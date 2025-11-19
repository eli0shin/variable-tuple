import type { ValidatePattern } from "./index";

function processQueryWithReturn<const T extends readonly unknown[]>(
  query: T & ValidatePattern<T>
): T {
  return query;
}

// Valid query
const result = processQueryWithReturn([{ name: "John" }, "AND", { age: 30 }]);

// Check if accessing out of bounds causes an error
const outOfBounds = result[10];

console.log(outOfBounds);
