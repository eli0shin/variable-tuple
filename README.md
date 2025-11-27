# barkql

Type-safe query builder with compile-time validation. Build complex queries with operators and get helpful error messages when the structure is invalid.

## Why?

Query strings are hard to work with:

- Long strings lack syntax highlighting and can't be formatted
- Errors are invisible until runtime
- Easy to put two operators next to each other or forget one

This library lets you build queries as structured data with compile-time validation.

## Installation

```bash
bun add barkql
```

## Quick Start

```typescript
import { query, compileDatadogQuery } from 'barkql';

// Build a query with compile-time validation
const q = query([{ service: 'api' }, 'AND', { env: 'production' }]);

// Compile to Datadog query string
const str = compileDatadogQuery(q);
// '(service:"api" AND env:"production")'
```

## Usage

### Simple query

```typescript
query([{ name: 'John' }]);
```

### Query with operators

```typescript
query([{ name: 'John' }, 'AND', { age: 30 }]);
query([{ status: 'active' }, 'OR', { role: 'admin' }]);
query([{ env: 'prod' }, 'AND NOT', { service: 'debug' }]);
```

### Nested queries

```typescript
query([[{ name: 'John' }, 'OR', { name: 'Jane' }], 'AND', { age: 30 }]);

query([
  [{ country: 'USA' }, 'OR', { country: 'Canada' }],
  'AND',
  [{ age: 25 }, 'OR', { experience: 5 }],
]);
```

### Query builder

```typescript
import { queryBuilder } from 'barkql';

const q = queryBuilder({ name: 'John' })
  .and({ age: 30 })
  .or({ active: true })
  .build();
```

### Compile to Datadog format

```typescript
import { compileDatadogQuery } from 'barkql';

compileDatadogQuery({ name: 'John', age: 30 });
// 'name:"John" AND age:30'

compileDatadogQuery([{ a: 1 }, 'AND', { b: 2 }]);
// '(a:1 AND b:2)'

compileDatadogQuery({ tags: ['error', 'warning'] });
// 'tags:("error" OR "warning")'
```

## Query Syntax

- **Operators**: `'AND' | 'OR' | 'AND NOT' | 'OR NOT'`
- **Values**: `string | number | boolean | null | Array<string | number | boolean | null>`
- **Pattern**: `[Query]` or `[Query, Operator, Query, ...]`
- **Nesting**: Any query position accepts a nested query chain
- **Arrays**: Compiled as `(value1 OR value2 OR ...)`

## API

### `query(input)`

Creates a type-safe query. Returns the input unchanged but validates the structure at compile time.

### `queryBuilder(initialQuery)`

Fluent builder with `.and()`, `.or()`, `.andNot()`, `.orNot()` methods. Call `.build()` to get the query.

### `compileDatadogQuery(query)`

Compiles a query to Datadog query string format.
