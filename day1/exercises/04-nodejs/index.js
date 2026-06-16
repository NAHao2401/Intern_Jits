/**
 * Bài 4.2: Import và test calculator module
 */

// TODO: Import calculator module
const { add, subtract, multiply, divide } = require("./calculator");

// TODO: Test tất cả các hàm
console.log(add(10, 3)); // 13
console.log(subtract(10, 3)); // 7
console.log(multiply(10, 3)); // 30
console.log(divide(10, 2)); // 5

// TODO: Test error case
try {
  divide(10, 0);
} catch (err) {
  console.error(err.message); // "Cannot divide by zero"
}
