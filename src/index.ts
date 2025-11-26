// Define the base types
export type Operator = "AND" | "OR" | "AND NOT" | "OR NOT";

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
              : "ERROR: After a Query, expected an Operator ('AND' | 'OR' | 'AND NOT' | 'OR NOT') but found something else."
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
export function query<const T extends readonly unknown[]>(
  query: T & ValidatePattern<T>
): T {
  return query;
}

// Builder pattern for type-safe construction (supports nesting)
type QueryBuilder<T extends readonly unknown[] = []> = {
  build: () => ValidatePattern<T>;
  and: <Q extends Query>(query: Q) => QueryBuilder<readonly [...T, "AND", Q]>;
  or: <Q extends Query>(query: Q) => QueryBuilder<readonly [...T, "OR", Q]>;
  andNot: <Q extends Query>(query: Q) => QueryBuilder<readonly [...T, "AND NOT", Q]>;
  orNot: <Q extends Query>(query: Q) => QueryBuilder<readonly [...T, "OR NOT", Q]>;
};

// Format a single QueryValue to string
function formatValue(value: QueryValue): string {
  if (typeof value === 'string') {
    return `"${value}"`
  }
  return String(value)
}

// Format an array of values with OR
function formatArrayValue(values: readonly QueryValue[]): string {
  return `(${values.map(formatValue).join(' OR ')})`
}

// Check if a value is a QueryChain (array/tuple)
function isQueryChain(value: unknown): value is readonly unknown[] {
  return Array.isArray(value)
}

// Check if a value is an Operator
function isOperator(value: unknown): value is Operator {
  return value === 'AND' || value === 'OR' || value === 'AND NOT' || value === 'OR NOT'
}

// Compile a BaseQueryType object to string
function compileBaseQuery(query: BaseQueryType): string {
  const entries = Object.entries(query)
  if (entries.length === 0) return ''

  return entries.map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}:${formatArrayValue(value)}`
    }
    return `${key}:${formatValue(value as QueryValue)}`
  }).join(' AND ')
}

// Compile a query to a Datadog query string
export function compileQuery(query: BaseQueryType): string
export function compileQuery<const T extends readonly unknown[]>(query: T & ValidatePattern<T>): string
export function compileQuery(query: unknown): string {
  // If it's an array (QueryChain), process recursively
  if (isQueryChain(query)) {
    const parts: string[] = []

    for (const element of query) {
      if (isOperator(element)) {
        parts.push(element)
      } else if (isQueryChain(element)) {
        // Recursive: nested QueryChain
        parts.push(compileQuery(element as readonly unknown[] as readonly [BaseQueryType]))
      } else {
        // BaseQueryType object
        parts.push(compileBaseQuery(element as BaseQueryType))
      }
    }

    return `(${parts.join(' ')})`
  }

  // It's a BaseQueryType object
  return compileBaseQuery(query as BaseQueryType)
}

export function queryBuilder<Q extends Query>(initialQuery: Q): QueryBuilder<readonly [Q]> {
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
    andNot: (query: Query) => {
      queries.push("AND NOT", query);
      return builder;
    },
    orNot: (query: Query) => {
      queries.push("OR NOT", query);
      return builder;
    },
  };
  
  return builder;
}