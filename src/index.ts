export type Operator = 'AND' | 'OR' | 'AND NOT' | 'OR NOT';

export type QueryValue = string | null | boolean | number;
export type BaseQueryType = Record<
  string,
  QueryValue | QueryValue[] | readonly QueryValue[]
>;

export type QueryChain<T extends readonly unknown[] = readonly unknown[]> =
  ValidatePattern<T>;

export type Query = BaseQueryType | QueryChain;

// Helper type that validates arrays while accepting BaseQueryType directly
type ValidatedQueryInput<Q> = Q extends readonly unknown[]
  ? Q & ValidatePattern<Q>
  : Q extends BaseQueryType
    ? Q
    : never;

type IsValidQuery<T> = T extends BaseQueryType
  ? true
  : T extends readonly unknown[]
    ? ValidatePatternWithError<T> extends 'valid'
      ? true
      : false
    : false;

export type ValidatePatternWithError<T extends readonly unknown[]> =
  T extends readonly []
    ? 'ERROR: Query cannot be empty. Expected: [Query] or [Query, Operator, Query, ...]'
    : T extends readonly [infer First, ...infer Rest]
      ? IsValidQuery<First> extends true
        ? Rest extends readonly []
          ? 'valid' // Single Query is valid
          : Rest extends readonly [infer Op, ...infer After]
            ? Op extends Operator
              ? After extends readonly []
                ? 'ERROR: Query cannot end with an Operator. Expected a Query after the Operator.'
                : After extends readonly [infer Next, ...infer RestAfter]
                  ? IsValidQuery<Next> extends true
                    ? ValidatePatternWithError<readonly [Next, ...RestAfter]>
                    : 'ERROR: After an Operator, expected a Query (BaseQueryType or nested QueryChain) but found something else.'
                  : 'ERROR: Invalid pattern structure. Expected: Query, Operator, Query, ...'
              : "ERROR: After a Query, expected an Operator ('AND' | 'OR' | 'AND NOT' | 'OR NOT') but found something else."
            : 'ERROR: Invalid pattern structure. After Query, expected an Operator followed by another Query.'
        : First extends Operator
          ? 'ERROR: Query cannot start with an Operator. It must start with a Query.'
          : 'ERROR: Query must start with a Query (BaseQueryType or nested QueryChain).'
      : 'ERROR: Invalid query pattern.';

export type ValidatePattern<T extends readonly unknown[]> =
  ValidatePatternWithError<T> extends 'valid' ? T : ValidatePatternWithError<T>;

/**
 * Creates a type-safe query with compile-time validation.
 *
 * @example
 * query([{ name: 'John' }])
 * query([{ name: 'John' }, 'AND', { age: 30 }])
 * query([[{ a: 1 }, 'OR', { b: 2 }], 'AND', { c: 3 }])
 */
export function query<const T extends readonly unknown[]>(
  query: T & ValidatePattern<T>
): T {
  return query;
}

type QueryBuilder<T extends readonly unknown[] = []> = {
  build: () => ValidatePattern<T>;
  and: <Q extends BaseQueryType | readonly unknown[]>(
    query: ValidatedQueryInput<Q>
  ) => QueryBuilder<
    readonly [...T, 'AND', Q extends readonly unknown[] ? Q : readonly [Q]]
  >;
  or: <Q extends BaseQueryType | readonly unknown[]>(
    query: ValidatedQueryInput<Q>
  ) => QueryBuilder<
    readonly [...T, 'OR', Q extends readonly unknown[] ? Q : readonly [Q]]
  >;
  andNot: <Q extends BaseQueryType | readonly unknown[]>(
    query: ValidatedQueryInput<Q>
  ) => QueryBuilder<
    readonly [...T, 'AND NOT', Q extends readonly unknown[] ? Q : readonly [Q]]
  >;
  orNot: <Q extends BaseQueryType | readonly unknown[]>(
    query: ValidatedQueryInput<Q>
  ) => QueryBuilder<
    readonly [...T, 'OR NOT', Q extends readonly unknown[] ? Q : readonly [Q]]
  >;
};

function formatValue(value: QueryValue): string {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return String(value);
}

function formatArrayValue(values: readonly QueryValue[]): string {
  return `(${values.map(formatValue).join(' OR ')})`;
}

function isQueryChain(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function isOperator(value: unknown): value is Operator {
  return (
    value === 'AND' ||
    value === 'OR' ||
    value === 'AND NOT' ||
    value === 'OR NOT'
  );
}

function compileBaseQuery(query: BaseQueryType): string {
  const entries = Object.entries(query);
  if (entries.length === 0) return '';

  return entries
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}:${formatArrayValue(value)}`;
      }
      return `${key}:${formatValue(value as QueryValue)}`;
    })
    .join(' AND ');
}

/**
 * Compiles a query to Datadog query string format.
 *
 * @example
 * compileDatadogQuery({ name: 'John', age: 30 })
 * // Returns: 'name:"John" AND age:30'
 *
 * compileDatadogQuery([{ a: 1 }, 'AND', { b: 2 }])
 * // Returns: '(a:1 AND b:2)'
 */
export function compileDatadogQuery(query: BaseQueryType): string;
export function compileDatadogQuery<const T extends readonly unknown[]>(
  query: T & ValidatePattern<T>
): string;
export function compileDatadogQuery(query: unknown): string {
  if (isQueryChain(query)) {
    const parts: string[] = [];

    for (const element of query) {
      if (isOperator(element)) {
        parts.push(element);
      } else if (isQueryChain(element)) {
        parts.push(
          compileDatadogQuery(
            element as readonly unknown[] as readonly [BaseQueryType]
          )
        );
      } else {
        parts.push(compileBaseQuery(element as BaseQueryType));
      }
    }

    return `(${parts.join(' ')})`;
  }

  return compileBaseQuery(query as BaseQueryType);
}

/**
 * Fluent builder for constructing queries with method chaining.
 *
 * @example
 * queryBuilder({ name: 'John' })
 *   .and({ age: 30 })
 *   .or({ active: true })
 *   .build()
 *
 * @example
 * queryBuilder([{ a: 1 }, 'OR', { b: 2 }] as const)
 *   .and({ c: 3 })
 *   .build()
 */
export function queryBuilder<Q extends BaseQueryType>(
  initialQuery: Q
): QueryBuilder<readonly [readonly [Q]]>;
export function queryBuilder<const T extends readonly unknown[]>(
  initialQuery: T & ValidatePattern<T>
): QueryBuilder<readonly [T]>;
export function queryBuilder(
  initialQuery: BaseQueryType | readonly unknown[]
): any {
  const wrapIfNeeded = (
    q: BaseQueryType | readonly unknown[]
  ): readonly unknown[] => (Array.isArray(q) ? q : [q]);

  const queries: unknown[] = [wrapIfNeeded(initialQuery)];

  const builder = {
    build: () => [...queries],
    and: (query: BaseQueryType | readonly unknown[]) => {
      queries.push('AND', wrapIfNeeded(query));
      return builder;
    },
    or: (query: BaseQueryType | readonly unknown[]) => {
      queries.push('OR', wrapIfNeeded(query));
      return builder;
    },
    andNot: (query: BaseQueryType | readonly unknown[]) => {
      queries.push('AND NOT', wrapIfNeeded(query));
      return builder;
    },
    orNot: (query: BaseQueryType | readonly unknown[]) => {
      queries.push('OR NOT', wrapIfNeeded(query));
      return builder;
    },
  };

  return builder;
}
