// Define the base types
export type Operator = "AND" | "OR";

export type QueryValue = string | null | boolean | number;
export type QueryType = Record<string, QueryValue | QueryValue[]>;

// Helper to check if pattern is valid (returns "valid" or error message)
export type ValidatePatternWithError<T extends readonly unknown[]> = 
  T extends readonly []
    ? "ERROR: Query cannot be empty. Expected: [QueryType] or [QueryType, Operator, QueryType, ...]"
    : T extends readonly [infer First, ...infer Rest]
      ? First extends QueryType
        ? Rest extends readonly []
          ? "valid" // Single QueryType is valid
          : Rest extends readonly [infer Op, ...infer After]
            ? Op extends Operator
              ? After extends readonly []
                ? "ERROR: Query cannot end with an Operator. Expected a QueryType after the Operator."
                : After extends readonly [infer Next, ...infer RestAfter]
                  ? Next extends QueryType
                    ? ValidatePatternWithError<readonly [Next, ...RestAfter]>
                    : "ERROR: After an Operator, expected a QueryType but found something else. Pattern must be: QueryType, Operator, QueryType, ..."
                  : "ERROR: Invalid pattern structure. Expected: QueryType, Operator, QueryType, ..."
              : "ERROR: After a QueryType, expected an Operator ('AND' | 'OR') but found something else."
            : "ERROR: Invalid pattern structure. After QueryType, expected an Operator followed by another QueryType."
        : First extends Operator
          ? "ERROR: Query cannot start with an Operator. It must start with a QueryType."
          : "ERROR: Query must start with a QueryType (Record<string, value>)."
      : "ERROR: Invalid query pattern.";

// Validate pattern and return T if valid, error message if invalid
export type ValidatePattern<T extends readonly unknown[]> = 
  ValidatePatternWithError<T> extends "valid" ? T : ValidatePatternWithError<T>;

// Main type alias
export type QueryChain<T extends readonly unknown[] = readonly unknown[]> = ValidatePattern<T>;

// Function using const type parameters (TypeScript 5.0+)
// No 'as const' needed when passing arrays inline!
export function processQuery<const T extends readonly unknown[]>(
  query: T & ValidatePattern<T>
): T {
  return query;
}

// Approach 3: Builder pattern for type-safe construction
type QueryBuilder<T extends readonly unknown[] = []> = {
  build: () => ValidatePattern<T>;
  and: <Q extends QueryType>(query: Q) => QueryBuilder<readonly [...T, "AND", Q]>;
  or: <Q extends QueryType>(query: Q) => QueryBuilder<readonly [...T, "OR", Q]>;
};

function createQuery<Q extends QueryType>(initialQuery: Q): QueryBuilder<readonly [Q]> {
  const queries: unknown[] = [initialQuery];
  
  const builder: any = {
    build: () => [...queries],
    and: (query: QueryType) => {
      queries.push("AND", query);
      return builder;
    },
    or: (query: QueryType) => {
      queries.push("OR", query);
      return builder;
    },
  };
  
  return builder;
}

// Examples - using as const to preserve literal types
const validQuery1 = [{ name: "John", age: 30 }] as const;
type Test1 = ValidatePattern<typeof validQuery1>; // Should work

const validQuery2 = [
  { name: "John" },
  "AND",
  { age: 30 }
] as const;
type Test2 = ValidatePattern<typeof validQuery2>; // Should work

const validQuery3 = [
  { name: "John" },
  "AND",
  { age: 30 },
  "OR",
  { status: true }
] as const;
type Test3 = ValidatePattern<typeof validQuery3>; // Should work

const validQuery4 = [
  { name: "John", tags: ["admin", "user"] },
  "AND",
  { age: 30, active: true },
  "OR",
  { status: null }
] as const;
type Test4 = ValidatePattern<typeof validQuery4>; // Should work

console.log("Valid query 1:", validQuery1);
console.log("Valid query 2:", validQuery2);
console.log("Valid query 3:", validQuery3);
console.log("Valid query 4:", validQuery4);

// Using the builder pattern
const builtQuery = createQuery({ name: "John" }).build();
console.log("Built query:", builtQuery);

console.log("\n=== Examples using const type parameter (no 'as const' needed!) ===");

// These work without 'as const' thanks to the const type parameter!
const result1 = processQuery([{ name: "Alice" }]);
console.log("Result 1:", result1);

const result2 = processQuery([{ name: "Bob" }, "AND", { age: 25 }]);
console.log("Result 2:", result2);

const result3 = processQuery([
  { name: "Charlie" },
  "AND",
  { age: 35 },
  "OR",
  { active: true }
]);
console.log("Result 3:", result3);

// ============================================
// NEGATIVE TEST CASES - These SHOULD cause type errors
// Uncomment any one to verify TypeScript catches the error
// ============================================

/*
// ERROR: Wrong operator string - "NAND" is not assignable to type 'Operator'
const invalidOperator: QueryChain = [
  { name: "John" },
  "NAND",
  { age: 30 }
];
*/

/*
// ERROR: Two sequential queries without operator
const sequentialQueries: QueryChain = [
  { name: "John" },
  { age: 30 }
];
*/

/*
// ERROR: Two sequential operators
const sequentialOperators: QueryChain = [
  { name: "John" },
  "AND",
  "OR",
  { age: 30 }
];
*/

/*
// ERROR: Ending with operator instead of query
const endsWithOperator: QueryChain = [
  { name: "John" },
  "AND"
];
*/

/*
// ERROR: Starting with operator
const startsWithOperator: QueryChain = [
  "AND",
  { name: "John" }
];
*/

/*
// ERROR: Wrong operator in middle - "XOR" is not assignable to type 'Operator'
const wrongMiddleOperator: QueryChain = [
  { name: "John" },
  "XOR",
  { age: 30 }
];
*/

/*
// ERROR: Operator as lowercase - "and" is not assignable to type 'Operator'
const lowercaseOperator: QueryChain = [
  { name: "John" },
  "and",
  { age: 30 }
];
*/

console.log("\n=== All negative test cases are commented out ===");
console.log("=== Uncomment any one to verify TypeScript catches the error ===");