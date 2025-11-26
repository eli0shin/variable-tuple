# Recursive Query Nesting

This document explains the recursive nesting feature that allows QueryChains to be composed infinitely.

## Core Concept

Any position in the pattern that expects a `Query` can contain either:

1. **BaseQueryType** - A simple `Record<string, value>` object
2. **QueryChain** - A nested, valid query pattern

This enables recursive composition of arbitrary depth.

## Type Structure

```typescript
type BaseQueryType = Record<string, QueryValue | QueryValue[]>;
type QueryChain = ValidatePattern<[...]>;
type Query = BaseQueryType | QueryChain;  // Either a base object OR a nested chain

// Pattern: [Query, Operator, Query, Operator, Query, ...]
```

## Examples

### Simple Nesting

```typescript
query([
  [{ name: 'John' }, 'OR', { name: 'Jane' }], // Nested QueryChain
  'AND',
  { age: 30 },
]);
```

### Deep Nesting

```typescript
query([
  { status: 'active' },
  'AND',
  [
    { name: 'John' },
    'OR',
    [{ age: 30 }, 'AND', { role: 'admin' }], // Multiple levels
  ],
]);
```

### Complex Composition

```typescript
query([
  [{ country: 'USA' }, 'OR', { country: 'Canada' }],
  'AND',
  [{ age: 25 }, 'OR', { experience: 5 }],
  'AND',
  { active: true },
]);
```

## Validation

Nested queries are validated recursively. The type system checks:

1. **Outer pattern** - Must follow `[Query, Operator, Query, ...]`
2. **Inner patterns** - Each nested array must also be a valid `QueryChain`
3. **All levels** - Validation cascades through all nesting levels

## Error Messages

Invalid nested queries produce clear error messages:

```typescript
query([
  [{ name: 'John' }, 'AND'], // ERROR: ends with operator
  'OR',
  { age: 30 },
]);
// Error: "Query must start with a Query (BaseQueryType or nested QueryChain)"
```

The error indicates that the nested array `[{ name: "John" }, "AND"]` is not a valid QueryChain.

## Use Cases

Nested queries enable modeling complex logical expressions:

```typescript
// (name = "John" OR name = "Jane") AND age = 30
query([[{ name: 'John' }, 'OR', { name: 'Jane' }], 'AND', { age: 30 }]);

// country IN (USA, Canada) AND (young OR experienced) AND active
query([
  [{ country: 'USA' }, 'OR', { country: 'Canada' }],
  'AND',
  [{ age: 25 }, 'OR', { experience: 5 }],
  'AND',
  { active: true },
]);
```

## Implementation Details

The `IsValidQuery<T>` helper type checks if `T` is either:

1. A `BaseQueryType` (returns `true`)
2. A readonly array that validates as a QueryChain (returns `true`)
3. Otherwise returns `false`

This enables the recursive validation:

```typescript
type IsValidQuery<T> = T extends BaseQueryType
  ? true
  : T extends readonly unknown[]
    ? ValidatePatternWithError<T> extends 'valid'
      ? true
      : false
    : false;
```

The main validation then uses `IsValidQuery` at each Query position, allowing both base types and nested chains.
