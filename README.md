# variable-tuple

TypeScript implementation of variable-length tuples with consistent patterns using recursive conditional types.

## Overview

This project demonstrates a type-safe tuple pattern that alternates between `Query` and `Operator`:
- Pattern: `[Query]` or `[Query, Operator, Query, Operator, Query, ...]`
- `BaseQueryType`: `Record<string, string | null | boolean | number | Array<...>>`
- `Query`: Either a `BaseQueryType` OR a nested `QueryChain` (recursive composition!)
- `Operator`: `"AND" | "OR"` (string literal type)
- **No hardcoded length limits** - uses recursive type validation with `infer` and mapped types
- **Supports recursive nesting** - any `Query` position can contain a nested `QueryChain`

## Implementation

The type system uses a DSL-style validation approach:

1. **`ValidatePatternWithError<T>`** - Recursively validates the pattern and returns:
   - `"valid"` if the pattern is correct
   - A descriptive error message string explaining what's wrong
2. **`ValidatePattern<T>`** - Returns `T` if valid, or the error message if invalid

This approach:
- Provides **clear, actionable error messages** instead of just `never`
- Avoids infinite type instantiation depth by checking pattern structure recursively
- Returns the original type `T` when valid instead of reconstructing it
- Acts as a **type-level DSL validator** with user-friendly feedback

### No `as const` Required!

Thanks to TypeScript 5.0's `const` type parameters, you can pass arrays inline without `as const`:

```typescript
import { processQuery } from "./index";

// ✨ No 'as const' needed!
processQuery([{ name: "Alice" }]);
processQuery([{ name: "Bob" }, "AND", { age: 25 }]);
processQuery([{ name: "Charlie" }, "AND", { age: 35 }, "OR", { active: true }]);
```

The `const` type parameter automatically infers literal tuple types, making the API more ergonomic while maintaining full type safety.

**Why `const` type parameters?** Without them (or `as const`), TypeScript widens array literals to union types like `(string | object)[]`. The `const` type parameter is the **only** way to prevent this widening at the call site. Alternatives like `infer`, `NoInfer`, or constraint tricks don't work because type inference happens before constraint checking. See `test-inference-patterns.ts` for detailed comparisons.

### Recursive Nesting Support

Any position expecting a `Query` can be a **nested `QueryChain`**, enabling complex compositions:

```typescript
import { processQuery } from "./index";

// Simple nesting
processQuery([
  [{ name: "John" }, "OR", { name: "Jane" }],  // Nested QueryChain
  "AND",
  { age: 30 }
]);

// Deep nesting
processQuery([
  { status: "active" },
  "AND",
  [
    { name: "John" },
    "OR",
    [{ age: 30 }, "AND", { role: "admin" }]  // Multiple levels
  ]
]);

// Complex composition
processQuery([
  [{ country: "USA" }, "OR", { country: "Canada" }],
  "AND",
  [{ age: 25 }, "OR", { experience: 5 }],
  "AND",
  { active: true }
]);
```

Nested queries are validated recursively - invalid nested structures produce clear error messages.

## Installation

```bash
bun install
```

## Usage

```bash
# Run valid examples
bun run index.ts

# Run all tests (runtime + type tests)
bun test

# Run type tests only
bun run test:types
```

## Type Safety Verification

The `ValidatePattern` type provides **descriptive error messages** as a DSL validator:

### Example Error Messages

```typescript
// Wrong operator
processQuery([{ name: "John" }, "NAND", { age: 30 }]);
// ERROR: After a Query, expected an Operator ('AND' | 'OR') but found something else.

// Sequential queries without operator
processQuery([{ name: "John" }, { age: 30 }]);
// ERROR: After a Query, expected an Operator ('AND' | 'OR') but found something else.

// Sequential operators
processQuery([{ name: "John" }, "AND", "OR", { age: 30 }]);
// ERROR: After an Operator, expected a Query (BaseQueryType or nested QueryChain) but found something else.

// Ending with operator
processQuery([{ name: "John" }, "AND"]);
// ERROR: Query cannot end with an Operator. Expected a Query after the Operator.

// Starting with operator
processQuery(["AND", { name: "John" }]);
// ERROR: Query cannot start with an Operator. It must start with a Query.
```

See `index.test-d.ts` for all error test cases.

## Project Info

This project was created using `bun init` in bun v1.3.2. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
