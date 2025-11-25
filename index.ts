// Define the base types
export type Operator = "AND" | "OR";

export type QueryValue = string | null | boolean | number;
export type BaseQueryType = Record<string, QueryValue | QueryValue[] | readonly QueryValue[]>;

// Forward declaration for recursive type
export type QueryChain<T extends readonly unknown[] = readonly unknown[]> = ValidatePattern<T>;

// A Query can be either a BaseQueryType or a nested QueryChain
export type Query = BaseQueryType | QueryChain;

// Helper to check if something is a valid query (base type or valid nested chain)
type IsValidQuery<T> = 
  T extends BaseQueryType
    ? true
    : T extends readonly unknown[]
      ? ValidatePatternWithError<T> extends "valid"
        ? true
        : false
      : false;

// Helper to check if pattern is valid (returns "valid" or error message)
// Now supports recursive nesting - any Query position can be a nested QueryChain
export type ValidatePatternWithError<T extends readonly unknown[]> = 
  T extends readonly []
    ? "ERROR: Query cannot be empty. Expected: [Query] or [Query, Operator, Query, ...]"
    : T extends readonly [infer First, ...infer Rest]
      ? IsValidQuery<First> extends true
        ? Rest extends readonly []
          ? "valid" // Single Query is valid
          : Rest extends readonly [infer Op, ...infer After]
            ? Op extends Operator
              ? After extends readonly []
                ? "ERROR: Query cannot end with an Operator. Expected a Query after the Operator."
                : After extends readonly [infer Next, ...infer RestAfter]
                  ? IsValidQuery<Next> extends true
                    ? ValidatePatternWithError<readonly [Next, ...RestAfter]>
                    : "ERROR: After an Operator, expected a Query (BaseQueryType or nested QueryChain) but found something else."
                  : "ERROR: Invalid pattern structure. Expected: Query, Operator, Query, ..."
              : "ERROR: After a Query, expected an Operator ('AND' | 'OR') but found something else."
            : "ERROR: Invalid pattern structure. After Query, expected an Operator followed by another Query."
        : First extends Operator
          ? "ERROR: Query cannot start with an Operator. It must start with a Query."
          : "ERROR: Query must start with a Query (BaseQueryType or nested QueryChain)."
      : "ERROR: Invalid query pattern.";

// Validate pattern and return T if valid, error message if invalid
export type ValidatePattern<T extends readonly unknown[]> = 
  ValidatePatternWithError<T> extends "valid" ? T : ValidatePatternWithError<T>;

// Function using const type parameters (TypeScript 5.0+)
// No 'as const' needed when passing arrays inline!
export function processQuery<const T extends readonly unknown[]>(
  query: T & ValidatePattern<T>
): T {
  return query;
}

// Builder pattern for type-safe construction (supports nesting)
type QueryBuilder<T extends readonly unknown[] = []> = {
  build: () => ValidatePattern<T>;
  and: <Q extends Query>(query: Q) => QueryBuilder<readonly [...T, "AND", Q]>;
  or: <Q extends Query>(query: Q) => QueryBuilder<readonly [...T, "OR", Q]>;
};

function createQuery<Q extends Query>(initialQuery: Q): QueryBuilder<readonly [Q]> {
  const queries: unknown[] = [initialQuery];
  
  const builder: any = {
    build: () => [...queries],
    and: (query: Query) => {
      queries.push("AND", query);
      return builder;
    },
    or: (query: Query) => {
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

console.log("\n=== Nested QueryChain examples (recursive composition!) ===");

// Simple nesting - a nested query in place of a base query
const nested1 = processQuery([
  [{ name: "John" }, "OR", { name: "Jane" }],  // Nested QueryChain
  "AND",
  { age: 30 }
]);
console.log("Nested 1:", nested1);

// Multiple levels of nesting
const nested2 = processQuery([
  { status: "active" },
  "AND",
  [
    { name: "John" },
    "OR",
    [{ age: 30 }, "AND", { role: "admin" }]  // Deeply nested
  ]
]);
console.log("Nested 2:", nested2);

// Complex nested structure
const nested3 = processQuery([
  [
    { country: "USA" },
    "OR",
    { country: "Canada" }
  ],
  "AND",
  [
    { age: 25 },
    "OR",
    { experience: 5 }
  ],
  "AND",
  { active: true }
]);
console.log("Nested 3:", nested3);

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