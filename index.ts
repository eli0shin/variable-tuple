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
  andNot: <Q extends Query>(query: Q) => QueryBuilder<readonly [...T, "AND NOT", Q]>;
  orNot: <Q extends Query>(query: Q) => QueryBuilder<readonly [...T, "OR NOT", Q]>;
};

export function createQuery<Q extends Query>(initialQuery: Q): QueryBuilder<readonly [Q]> {
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