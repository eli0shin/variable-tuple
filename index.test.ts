import { test, expect, describe } from 'vitest'
import { processQuery, createQuery } from './index'

describe('processQuery', () => {
  describe('single query', () => {
    test('returns input for single query object', () => {
      const query = [{ name: "John" }] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('handles query with multiple fields', () => {
      const query = [{ name: "John", age: 30, active: true }] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('handles query with array values', () => {
      expect(processQuery([{ tags: ["admin", "user"], ids: [1, 2, 3] }])).toEqual([{ tags: ["admin", "user"], ids: [1, 2, 3] }])
    })

    test('handles query with null value', () => {
      const query = [{ status: null }] as const
      expect(processQuery(query)).toEqual(query)
    })
  })

  describe('query chain', () => {
    test('returns input for simple AND chain', () => {
      const query = [{ name: "John" }, "AND", { age: 30 }] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('returns input for simple OR chain', () => {
      const query = [{ name: "John" }, "OR", { age: 30 }] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('returns input for longer chain', () => {
      const query = [
        { name: "John" },
        "AND",
        { age: 30 },
        "OR",
        { status: true }
      ] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('returns input for chain with mixed operators', () => {
      const query = [
        { a: 1 },
        "AND",
        { b: 2 },
        "OR",
        { c: 3 },
        "AND",
        { d: 4 }
      ] as const
      expect(processQuery(query)).toEqual(query)
    })
  })

  describe('nested queries', () => {
    test('returns input for simple nested query', () => {
      const query = [
        [{ name: "John" }, "OR", { name: "Jane" }],
        "AND",
        { age: 30 }
      ] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('returns input for deeply nested query', () => {
      const query = [
        { status: "active" },
        "AND",
        [
          { name: "John" },
          "OR",
          [{ age: 30 }, "AND", { role: "admin" }]
        ]
      ] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('returns input for complex nested structure', () => {
      const query = [
        [{ country: "USA" }, "OR", { country: "Canada" }],
        "AND",
        [{ age: 25 }, "OR", { experience: 5 }],
        "AND",
        { active: true }
      ] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('returns input for single nested query at root', () => {
      const query = [
        [{ name: "John" }, "AND", { age: 30 }]
      ] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('handles mixed nested and flat queries', () => {
      const query = [
        { a: 1 },
        "AND",
        [{ b: 2 }, "OR", { c: 3 }],
        "OR",
        { d: 4 }
      ] as const
      expect(processQuery(query)).toEqual(query)
    })
  })

  describe('AND NOT and OR NOT operators', () => {
    test('returns input for simple AND NOT chain', () => {
      const query = [{ name: "John" }, "AND NOT", { status: "banned" }] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('returns input for simple OR NOT chain', () => {
      const query = [{ name: "John" }, "OR NOT", { age: 30 }] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('returns input for chain with mixed NOT operators', () => {
      const query = [
        { active: true },
        "AND NOT",
        { banned: true },
        "OR NOT",
        { suspended: true }
      ] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('returns input for chain mixing all operator types', () => {
      const query = [
        { name: "John" },
        "AND",
        { active: true },
        "AND NOT",
        { banned: true },
        "OR",
        { admin: true },
        "OR NOT",
        { guest: true }
      ] as const
      expect(processQuery(query)).toEqual(query)
    })

    test('returns input for nested queries with NOT operators', () => {
      const query = [
        [{ country: "USA" }, "OR NOT", { banned: true }],
        "AND NOT",
        { suspended: true }
      ] as const
      expect(processQuery(query)).toEqual(query)
    })
  })

  describe('createQuery builder', () => {
    test('builds single query', () => {
      const result = createQuery({ name: "John" }).build()
      expect(result).toEqual([{ name: "John" }])
    })

    test('builds query with and()', () => {
      const result = createQuery({ name: "John" }).and({ age: 30 }).build()
      expect(result).toEqual([{ name: "John" }, "AND", { age: 30 }])
    })

    test('builds query with or()', () => {
      const result = createQuery({ name: "John" }).or({ name: "Jane" }).build()
      expect(result).toEqual([{ name: "John" }, "OR", { name: "Jane" }])
    })

    test('builds query with andNot()', () => {
      const result = createQuery({ active: true }).andNot({ banned: true }).build()
      expect(result).toEqual([{ active: true }, "AND NOT", { banned: true }])
    })

    test('builds query with orNot()', () => {
      const result = createQuery({ name: "John" }).orNot({ suspended: true }).build()
      expect(result).toEqual([{ name: "John" }, "OR NOT", { suspended: true }])
    })

    test('chains multiple operators', () => {
      const result = createQuery({ a: 1 })
        .and({ b: 2 })
        .or({ c: 3 })
        .andNot({ d: 4 })
        .orNot({ e: 5 })
        .build()
      expect(result).toEqual([
        { a: 1 },
        "AND", { b: 2 },
        "OR", { c: 3 },
        "AND NOT", { d: 4 },
        "OR NOT", { e: 5 }
      ])
    })
  })
})
