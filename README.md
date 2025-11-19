# variable-tuple

TypeScript implementation of variable-length tuples with consistent patterns using recursive conditional types.

## Overview

This project demonstrates a type-safe tuple pattern that alternates between `QueryType` and `Operator`:
- Pattern: `[QueryType]` or `[QueryType, Operator, QueryType, Operator, QueryType, ...]`
- `QueryType`: `Record<string, string | null | boolean | number | Array<...>>`
- `Operator`: `"AND" | "OR"` (string literal type)
- **No hardcoded length limits** - uses recursive type validation with `infer` and mapped types

## Implementation

The type system uses two key types:

1. **`IsValidPattern<T>`** - Recursively validates the pattern returns `true` or `false`
2. **`ValidatePattern<T>`** - Returns `T` if valid, `never` if invalid

This approach avoids infinite type instantiation depth by:
- Using a boolean validation helper (`IsValidPattern`)
- Recursively checking pairs of elements
- Returning the original type `T` when valid instead of reconstructing it

## Installation

```bash
bun install
```

## Usage

```bash
# Run valid examples
bun run index.ts

# Run valid queries (runtime)
bun test-errors.ts

# Type check all error cases
bunx tsc --noEmit test-all-errors.ts
```

## Type Safety Verification

The `ValidatePattern` type successfully catches these errors:

✅ **Wrong operator string** - `"NAND"` is not assignable to type `'Operator'`  
✅ **Sequential queries** - Two `QueryType` objects in a row without an operator  
✅ **Sequential operators** - Two operators in a row without a query  
✅ **Ending with operator** - Tuple must end with `QueryType`  
✅ **Starting with operator** - Tuple must start with `QueryType`  
✅ **Invalid operator** - Only `"AND"` and `"OR"` are allowed  
✅ **Case sensitivity** - `"and"` is not the same as `"AND"`

See `test-all-errors.ts` for all error cases.

## Project Info

This project was created using `bun init` in bun v1.3.2. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
