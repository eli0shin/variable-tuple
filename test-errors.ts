// This file demonstrates that TypeScript catches invalid QueryChain patterns
// Run: bun test-errors.ts
// Expected: TypeScript compilation errors

import type { ValidatePattern } from "./index";

// TEST 1: Wrong operator string
const invalidOperator = [
  { name: "John" },
  "NAND", // ERROR: Type '"NAND"' is not assignable to type 'Operator'
  { age: 30 }
] as const;
type InvalidOperatorTest = ValidatePattern<typeof invalidOperator>;

// TEST 2: Two sequential queries without operator
const sequentialQueries = [
  { name: "John" },
  { age: 30 } // ERROR: After QueryType must be Operator
] as const;
type SequentialQueriesTest = ValidatePattern<typeof sequentialQueries>;

// TEST 3: Two sequential operators
const sequentialOperators = [
  { name: "John" },
  "AND",
  "OR", // ERROR: After operator must be QueryType
  { age: 30 }
] as const;
type SequentialOperatorsTest = ValidatePattern<typeof sequentialOperators>;

// TEST 4: Ending with operator instead of query
const endsWithOperator = [
  { name: "John" },
  "AND" // ERROR: Pattern is invalid (odd length required)
] as const;
type EndsWithOperatorTest = ValidatePattern<typeof endsWithOperator>;

// TEST 5: Starting with operator
const startsWithOperator = [
  "AND", // ERROR: Must start with QueryType
  { name: "John" }
] as const;
type StartsWithOperatorTest = ValidatePattern<typeof startsWithOperator>;

// TEST 6: Wrong operator in middle
const wrongMiddleOperator = [
  { name: "John" },
  "XOR", // ERROR: Type '"XOR"' is not assignable to type 'Operator'
  { age: 30 }
] as const;
type WrongMiddleOperatorTest = ValidatePattern<typeof wrongMiddleOperator>;

// TEST 7: Operator as lowercase
const lowercaseOperator = [
  { name: "John" },
  "and", // ERROR: Type '"and"' is not assignable to type 'Operator'
  { age: 30 }
] as const;
type LowercaseOperatorTest = ValidatePattern<typeof lowercaseOperator>;

// Function that only accepts valid QueryChain patterns
function processQuery<T extends readonly unknown[]>(
  query: T & ValidatePattern<T>
): void {
  console.log("Processing query:", query);
}

// These should all cause type errors when uncommented:

/*
// TEST 1: Wrong operator string
processQuery([
  { name: "John" },
  "NAND", // ERROR
  { age: 30 }
] as const);
*/

/*
// TEST 2: Two sequential queries
processQuery([
  { name: "John" },
  { age: 30 } // ERROR
] as const);
*/

/*
// TEST 3: Two sequential operators
processQuery([
  { name: "John" },
  "AND",
  "OR", // ERROR
  { age: 30 }
] as const);
*/

/*
// TEST 4: Ending with operator
processQuery([
  { name: "John" },
  "AND" // ERROR
] as const);
*/

/*
// TEST 5: Starting with operator
processQuery([
  "AND", // ERROR
  { name: "John" }
] as const);
*/

// Valid queries should work fine
processQuery([{ name: "John" }] as const);
processQuery([{ name: "John" }, "AND", { age: 30 }] as const);
processQuery([{ name: "John" }, "AND", { age: 30 }, "OR", { status: true }] as const);

console.log("✓ All valid queries processed successfully!");
