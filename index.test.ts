import { test, expect, describe } from 'vitest'
import { processQuery } from './index'

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
})
