/**
 * Bài 4.2: CommonJS Module
 * Tạo calculator module và export các hàm
 */

// TODO: Viết các hàm sau và export chúng
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}
// add(a, b) - cộng hai số
// subtract(a, b) - trừ hai số
// multiply(a, b) - nhân hai số
// divide(a, b) - chia hai số, throw Error("Cannot divide by zero") nếu b === 0

// Export tất cả dùng module.exports
module.exports = {
  add,
  subtract,
  multiply,
  divide,
};
