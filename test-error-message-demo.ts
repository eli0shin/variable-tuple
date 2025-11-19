import { processQuery } from "./index";

// This will show the descriptive error message
processQuery([
  { name: "John" },
  "NAND",
  { age: 30 }
]);
