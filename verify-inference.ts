// This file verifies type inference differences

function standardGeneric<T extends readonly unknown[]>(query: T): T {
  return query;
}

function constTypeParam<const T extends readonly unknown[]>(query: T): T {
  return query;
}

// Test widening behavior
const result1 = standardGeneric([{ name: "John" }, "AND", { age: 30 }]);
const result2 = constTypeParam([{ name: "John" }, "AND", { age: 30 }]);

// result1 is widened - this should be string | object, not "AND"
const test1: string = result1[1];

// result2 is literal - this should be exactly "AND"
const test2: "AND" = result2[1];

// result2 out of bounds should error
const test3 = result2[10];

console.log("Done");
