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
// Using 'const' type parameter to infer literal types without 'as const'
function processQuery<const T extends readonly unknown[]>(
  query: T & ValidatePattern<T>
): void {
  console.log("Processing query:", query);
}

// These should all cause type errors when uncommented (no 'as const' needed!):

/*
// TEST 1: Wrong operator string
processQuery([
  { name: "John" },
  "NAND",
  { age: 30 }
]);
// ERROR: After a QueryType, expected an Operator ('AND' | 'OR') but found something else.
*/

/*
// TEST 2: Two sequential queries
processQuery([
  { name: "John" },
  { age: 30 }
]);
// ERROR: After a QueryType, expected an Operator ('AND' | 'OR') but found something else.
*/

/*
// TEST 3: Two sequential operators
processQuery([
  { name: "John" },
  "AND",
  "OR",
  { age: 30 }
]);
// ERROR: After an Operator, expected a QueryType but found something else. Pattern must be: QueryType, Operator, QueryType, ...
*/

/*
// TEST 4: Ending with operator
processQuery([
  { name: "John" },
  "AND"
]);
// ERROR: Query cannot end with an Operator. Expected a QueryType after the Operator.
*/

/*
// TEST 5: Starting with operator
processQuery([
  "AND",
  { name: "John" }
]);
// ERROR: Query cannot start with an Operator. It must start with a QueryType.
*/

// Valid queries should work fine - no 'as const' needed!
processQuery([{ name: "John" }]);
processQuery([{ name: "John" }, "AND", { age: 30 }]);
processQuery([{ name: "John" }, "AND", { age: 30 }, "OR", { status: true }]);

console.log("✓ All valid queries processed successfully!");
