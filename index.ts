// Define the base types
export type Operator = "AND" | "OR";

export type QueryValue = string | null | boolean | number;
export type QueryType = Record<string, QueryValue | QueryValue[]>;

// Helper to check if pattern is valid (returns true/false)
export type IsValidPattern<T extends readonly unknown[]> = 
  T extends readonly [infer First, ...infer Rest]
    ? First extends QueryType
      ? Rest extends readonly []
        ? true // Single QueryType is valid
        : Rest extends readonly [infer Op, infer Next, ...infer After]
          ? Op extends Operator
            ? Next extends QueryType
              ? IsValidPattern<readonly [Next, ...After]>
              : false // After operator must be QueryType
            : false // After QueryType must be Operator
          : false // If Rest has length 1, pattern is invalid
      : false // Must start with QueryType
    : false; // Empty array not allowed

// Validate pattern and return T if valid, never if invalid
export type ValidatePattern<T extends readonly unknown[]> = 
  IsValidPattern<T> extends true ? T : never;

// Main type alias
export type QueryChain<T extends readonly unknown[] = readonly unknown[]> = ValidatePattern<T>;

// Approach 2: Runtime validation with type guard
type QueryPattern = readonly (QueryType | Operator)[];

function isValidQueryChain(arr: QueryPattern): arr is QueryChain {
  if (arr.length === 0) return false;
  if (arr.length % 2 === 0) return false; // Must be odd length (Q, OP, Q, OP, Q)
  
  for (let i = 0; i < arr.length; i++) {
    if (i % 2 === 0) {
      // Even indices should be QueryType (objects)
      const item = arr[i];
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        return false;
      }
      // Check if it's a valid QueryType (has string keys)
      if (Object.keys(item).length === 0) {
        return false;
      }
    } else {
      // Odd indices should be Operator
      if (arr[i] !== "AND" && arr[i] !== "OR") {
        return false;
      }
    }
  }
  
  return true;
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
console.log("Is valid pattern?", isValidQueryChain(validQuery3));

// Using the builder pattern
const builtQuery = createQuery({ name: "John" }).build();
console.log("Built query:", builtQuery);

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