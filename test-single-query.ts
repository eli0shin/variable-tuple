import { processQuery } from "./index";

// Single query object (most basic case)
const single1 = processQuery([{ name: "John" }]);
console.log("Single query 1:", single1);

const single2 = processQuery([{ age: 30, status: "active" }]);
console.log("Single query 2:", single2);

// Single nested query
const singleNested = processQuery([
  [{ name: "John" }, "OR", { name: "Jane" }]
]);
console.log("Single nested query:", singleNested);

console.log("\nAll single query tests passed!");
