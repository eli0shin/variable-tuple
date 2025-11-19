import type { ValidatePattern, QueryType, Operator } from "./index";

console.log("\n=== Testing TypeScript literal type inference patterns ===\n");

// ===== FINDING: const type parameter is the ONLY way =====
// Without 'const' type parameter or 'as const', TypeScript widens array literals

// ❌ Approach 1: Standard generic - types get widened
function standardGeneric<T extends readonly unknown[]>(query: T): T {
  return query;
}

const test1 = standardGeneric([{ name: "John" }, "AND", { age: 30 }]);
type Test1 = typeof test1;
// Result: (string | { name: string; } | { age: number; })[]  ❌ Widened!

// ✅ Approach 2: const type parameter - works!
function constTypeParam<const T extends readonly unknown[]>(query: T): T {
  return query;
}

const test2 = constTypeParam([{ name: "John" }, "AND", { age: 30 }]);
type Test2 = typeof test2;
// Result: readonly [{ readonly name: "John"; }, "AND", { readonly age: 30; }]  ✅ Literal!

// ❌ Approach 3: Overloads - works but defeats the purpose (hardcoded lengths)
function withOverloads(query: readonly [QueryType]): readonly [QueryType];
function withOverloads(
  query: readonly [QueryType, Operator, QueryType]
): readonly [QueryType, Operator, QueryType];
function withOverloads(query: readonly unknown[]): readonly unknown[] {
  return query;
}

const test3 = withOverloads([{ name: "John" }, "AND", { age: 30 }]);
type Test3 = typeof test3;
// Result: readonly [QueryType, Operator, QueryType]  ⚠️ Not literal, just pattern

// ❌ Approach 4: Parameter spread - doesn't preserve tuple structure
function withSpread<T extends readonly unknown[]>(...args: T): T {
  return args as T;
}

// Would need: withSpread({ name: "John" }, "AND", { age: 30 })
// This is awkward and changes the API

// ❌ Approach 5: NoInfer - prevents inference, doesn't force narrowing
function withNoInfer<T extends readonly unknown[]>(query: NoInfer<T>): T {
  return query as T;
}

const test5 = withNoInfer([{ name: "John" }, "AND", { age: 30 }]);
type Test5 = typeof test5;
// Result: (string | { name: string; } | { age: number; })[]  ❌ Still widened!

// ===== CONCLUSION =====
console.log("Test 1 (standard generic):", test1);
console.log("Test 2 (const type param):", test2);
console.log("Test 3 (overloads):", test3);
console.log("Test 5 (NoInfer):", test5);

console.log("\n✨ CONCLUSION: 'const' type parameters (TS 5.0+) are the ONLY way");
console.log("to infer literal tuple types without 'as const' at the call site.\n");

// ===== ALTERNATIVE: Type-level validation without literal inference =====
// If we don't need literal types, we can validate the pattern at the type level
// but lose the specific values

type PatternCheck<T extends readonly unknown[]> = 
  ValidatePattern<T> extends never ? "Invalid pattern" : "Valid pattern";

// This checks the pattern but doesn't preserve literals
type Check1 = PatternCheck<[QueryType, Operator, QueryType]>; // "Valid pattern"
type Check2 = PatternCheck<[QueryType, QueryType]>; // "Invalid pattern"

console.log("Pattern validation works at type level, but loses literal values");
