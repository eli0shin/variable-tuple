# All Error Messages

This file shows all the different error messages the type system produces.

## 1. Wrong Operator String

```typescript
processQuery([{ name: "John" }, "NAND", { age: 30 }]);
```

**Error:** `ERROR: After a Query, expected an Operator ('AND' | 'OR') but found something else.`

## 2. Sequential Queries (Missing Operator)

```typescript
processQuery([{ name: "John" }, { age: 30 }]);
```

**Error:** `ERROR: After a Query, expected an Operator ('AND' | 'OR') but found something else.`

## 3. Sequential Operators (Missing Query)

```typescript
processQuery([{ name: "John" }, "AND", "OR", { age: 30 }]);
```

**Error:** `ERROR: After an Operator, expected a Query (BaseQueryType or nested QueryChain) but found something else.`

## 4. Ending with Operator

```typescript
processQuery([{ name: "John" }, "AND"]);
```

**Error:** `ERROR: Query cannot end with an Operator. Expected a Query after the Operator.`

## 5. Starting with Operator

```typescript
processQuery(["AND", { name: "John" }]);
```

**Error:** `ERROR: Query cannot start with an Operator. It must start with a Query.`

## 6. Invalid Nested Query (ends with operator)

```typescript
processQuery([
  [{ name: "John" }, "AND"],  // Invalid nested query
  "OR",
  { age: 30 }
]);
```

**Error:** `ERROR: Query must start with a Query (BaseQueryType or nested QueryChain).`

Note: The nested array `[{ name: "John" }, "AND"]` is invalid because it ends with an operator.

## 7. Invalid Nested Query (sequential queries)

```typescript
processQuery([
  [{ name: "John" }, { name: "Jane" }],  // Invalid nested query
  "AND",
  { age: 30 }
]);
```

**Error:** `ERROR: Query must start with a Query (BaseQueryType or nested QueryChain).`

Note: The nested array `[{ name: "John" }, { name: "Jane" }]` is invalid because it has sequential queries without an operator.

## Valid Queries

```typescript
// Simple queries
processQuery([{ name: "John" }]);
processQuery([{ name: "John" }, "AND", { age: 30 }]);
processQuery([{ name: "John" }, "AND", { age: 30 }, "OR", { status: true }]);

// Nested queries
processQuery([
  [{ name: "John" }, "OR", { name: "Jane" }],
  "AND",
  { age: 30 }
]);

// Deeply nested queries
processQuery([
  { status: "active" },
  "AND",
  [
    { name: "John" },
    "OR",
    [{ age: 30 }, "AND", { role: "admin" }]
  ]
]);
```
