import { test, expectTypeOf } from 'vitest'
import { query } from './index'
import type { ValidatePattern, ValidatePatternWithError, BaseQueryType, Query } from './index'

// ============================================
// VALID CASES - Should compile without errors
// ============================================

test('valid single query', () => {
  // Just verifying this compiles - no assertion needed
  query([{ name: "John" }])
})

test('valid query chain with AND', () => {
  query([{ name: "John" }, "AND", { age: 30 }])
})

test('valid query chain with OR', () => {
  query([{ name: "John" }, "OR", { age: 30 }])
})

test('valid longer query chain', () => {
  query([
    { name: "John" },
    "AND",
    { age: 30 },
    "OR",
    { status: true }
  ])
})

test('valid nested query', () => {
  query([
    [{ name: "John" }, "OR", { name: "Jane" }],
    "AND",
    { age: 30 }
  ])
})

test('valid deeply nested query', () => {
  query([
    { status: "active" },
    "AND",
    [
      { name: "John" },
      "OR",
      [{ age: 30 }, "AND", { role: "admin" }]
    ]
  ])
})

test('valid complex nested structure', () => {
  query([
    [{ country: "USA" }, "OR", { country: "Canada" }],
    "AND",
    [{ age: 25 }, "OR", { experience: 5 }],
    "AND",
    { active: true }
  ])
})

test('valid single nested query at root', () => {
  query([
    [{ name: "John" }, "AND", { age: 30 }]
  ])
})

test('valid query chain with AND NOT', () => {
  query([{ name: "John" }, "AND NOT", { banned: true }])
})

test('valid query chain with OR NOT', () => {
  query([{ name: "John" }, "OR NOT", { suspended: true }])
})

test('valid chain mixing all operators', () => {
  query([
    { name: "John" },
    "AND",
    { active: true },
    "AND NOT",
    { banned: true },
    "OR",
    { admin: true },
    "OR NOT",
    { guest: true }
  ])
})

test('valid nested query with NOT operators', () => {
  query([
    [{ country: "USA" }, "OR NOT", { banned: true }],
    "AND NOT",
    { suspended: true }
  ])
})

// ============================================
// INVALID CASES - Should produce type errors
// ============================================

test('empty query should error', () => {
  // @ts-expect-error empty query is invalid
  query([])
})

test('empty nested query should error', () => {
  // @ts-expect-error empty nested array is invalid
  query([[], "AND", { age: 30 }])
})

test('wrong operator should error', () => {
  // @ts-expect-error "NAND" is not a valid operator
  query([{ name: "John" }, "NAND", { age: 30 }])
})

test('lowercase operator should error', () => {
  // @ts-expect-error "and" is not a valid operator (must be uppercase)
  query([{ name: "John" }, "and", { age: 30 }])
})

test('sequential queries should error', () => {
  // @ts-expect-error two queries without operator
  query([{ name: "John" }, { age: 30 }])
})

test('sequential operators should error', () => {
  // @ts-expect-error two operators in a row
  query([{ name: "John" }, "AND", "OR", { age: 30 }])
})

test('ends with operator should error', () => {
  // @ts-expect-error cannot end with operator
  query([{ name: "John" }, "AND"])
})

test('starts with operator should error', () => {
  // @ts-expect-error cannot start with operator
  query(["AND", { name: "John" }])
})

// ============================================
// NESTED ERROR CASES - Should produce type errors
// ============================================

test('nested query ends with operator should error', () => {
  // @ts-expect-error nested query cannot end with operator
  query([
    [{ name: "John" }, "AND"],
    "OR",
    { age: 30 }
  ])
})

test('nested query starts with operator should error', () => {
  // @ts-expect-error nested query cannot start with operator
  query([
    ["AND", { name: "John" }],
    "OR",
    { age: 30 }
  ])
})

test('nested sequential queries should error', () => {
  // @ts-expect-error nested sequential queries without operator
  query([
    [{ name: "John" }, { name: "Jane" }],
    "AND",
    { age: 30 }
  ])
})

test('deeply nested invalid query should error', () => {
  // @ts-expect-error invalid at depth 2 - ends with operator
  query([
    { status: "active" },
    "AND",
    [
      { name: "John" },
      "OR",
      [{ age: 30 }, "AND"]
    ]
  ])
})

test('nested empty array should error', () => {
  // @ts-expect-error nested empty array is invalid
  query([
    { name: "John" },
    "AND",
    []
  ])
})

// ============================================
// TYPE VALIDATION TESTS
// ============================================

test('ValidatePattern returns input type for valid pattern', () => {
  type Result = ValidatePattern<readonly [{ name: string }, "AND", { age: number }]>
  expectTypeOf<Result>().toEqualTypeOf<readonly [{ name: string }, "AND", { age: number }]>()
})

test('BaseQueryType accepts valid query objects', () => {
  const query: BaseQueryType = { name: "John", age: 30, active: true }
  expectTypeOf(query).toExtend<BaseQueryType>()
})

test('BaseQueryType accepts arrays of primitives', () => {
  const query: BaseQueryType = { tags: ["admin", "user"], ids: [1, 2, 3] }
  expectTypeOf(query).toExtend<BaseQueryType>()
})

test('Query type accepts BaseQueryType', () => {
  const query: Query = { name: "John" }
  expectTypeOf(query).toExtend<Query>()
})

// ============================================
// ERROR MESSAGE CONTENT TESTS
// ============================================

test('empty query returns correct error message', () => {
  type Result = ValidatePatternWithError<readonly []>
  expectTypeOf<Result>().toEqualTypeOf<"ERROR: Query cannot be empty. Expected: [Query] or [Query, Operator, Query, ...]">()
})

test('starting with operator returns correct error message', () => {
  type Result = ValidatePatternWithError<readonly ["AND", { name: string }]>
  expectTypeOf<Result>().toEqualTypeOf<"ERROR: Query cannot start with an Operator. It must start with a Query.">()
})

test('ending with operator returns correct error message', () => {
  type Result = ValidatePatternWithError<readonly [{ name: string }, "AND"]>
  expectTypeOf<Result>().toEqualTypeOf<"ERROR: Query cannot end with an Operator. Expected a Query after the Operator.">()
})

test('invalid operator returns correct error message', () => {
  type Result = ValidatePatternWithError<readonly [{ name: string }, "NAND", { age: number }]>
  expectTypeOf<Result>().toEqualTypeOf<"ERROR: After a Query, expected an Operator ('AND' | 'OR' | 'AND NOT' | 'OR NOT') but found something else.">()
})
