# All Error Messages

This file shows all the different error messages the type system produces.

## 1. Wrong Operator String

```typescript
processQuery([{ name: "John" }, "NAND", { age: 30 }]);
```

**Error:** `ERROR: After a QueryType, expected an Operator ('AND' | 'OR') but found something else.`

## 2. Sequential Queries (Missing Operator)

```typescript
processQuery([{ name: "John" }, { age: 30 }]);
```

**Error:** `ERROR: After a QueryType, expected an Operator ('AND' | 'OR') but found something else.`

## 3. Sequential Operators (Missing Query)

```typescript
processQuery([{ name: "John" }, "AND", "OR", { age: 30 }]);
```

**Error:** `ERROR: After an Operator, expected a QueryType but found something else. Pattern must be: QueryType, Operator, QueryType, ...`

## 4. Ending with Operator

```typescript
processQuery([{ name: "John" }, "AND"]);
```

**Error:** `ERROR: Query cannot end with an Operator. Expected a QueryType after the Operator.`

## 5. Starting with Operator

```typescript
processQuery(["AND", { name: "John" }]);
```

**Error:** `ERROR: Query cannot start with an Operator. It must start with a QueryType.`

## Valid Queries

```typescript
// These all work fine
processQuery([{ name: "John" }]);
processQuery([{ name: "John" }, "AND", { age: 30 }]);
processQuery([{ name: "John" }, "AND", { age: 30 }, "OR", { status: true }]);
```
