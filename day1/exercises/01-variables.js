/**
 * Bài 1: Biến & Kiểu dữ liệu
 * Day 1 - JavaScript Cơ bản
 */

// ============================================================
// Bài 1.1: Khai báo biến
// Tạo các biến sau và log kết quả ra console
// ============================================================

// TODO: Khai báo họ tên đầy đủ của bạn (dùng const)
// TODO: Khai báo tuổi (dùng let)
// TODO: Khai báo có phải lập trình viên không (dùng const, kiểu boolean)
// TODO: Khai báo danh sách kỹ năng (dùng const, kiểu array)
const fullName = "Nguyen Anh Hao";
let age = 22;
const isDeveloper = true;
const skills = ["JavaScript", "Python", "Java", "C++"];

// ============================================================
// Bài 1.2: Template literals
// ============================================================
// TODO: Tạo string mô tả bản thân dùng template literal
// Ví dụ: "Tôi là Nguyen Van A, 22 tuổi, là lập trình viên"
let description = `Tôi là ${fullName}, ${age} tuổi, là lập trình viên: ${isDeveloper ? "Có" : "Không"}, Kỹ năng của tôi gồm ${skills.join(", ")}.`;
console.log(description);
// ============================================================
// Bài 1.3: Phép toán cơ bản
// ============================================================

// TODO: Khai báo 2 số bất kỳ
// TODO: Tính và log: tổng, hiệu, tích, thương
// TODO: Dùng Math.round(), Math.floor(), Math.ceil() với số thập phân
const num1 = 66,
  num2 = 88;
console.log(`Tổng của ${num1} và ${num2} là: ${num1 + num2}`);
console.log(`Hiệu của ${num1} và ${num2} là: ${num1 - num2}`);
console.log(`Tích của ${num1} và ${num2} là: ${num1 * num2}`);
console.log(`Thương của ${num1} và ${num2} là: ${num1 / num2}`);

const decimalNum = 68.86;
console.log(`Số ${decimalNum} sau khi làm tròn: ${Math.round(decimalNum)}`);
console.log(
  `Số ${decimalNum} sau khi làm tròn xuống: ${Math.floor(decimalNum)}`,
);
console.log(`Số ${decimalNum} sau khi làm tròn lên: ${Math.ceil(decimalNum)}`);

// ============================================================
// Bài 1.4: Kiểm tra kiểu dữ liệu
// ============================================================

// TODO: Viết function checkType(value) nhận vào một giá trị
// Log ra kiểu dữ liệu của giá trị đó
// Xử lý đặc biệt: null phải log "null" (không phải "object")
//                 Array phải log "array" (không phải "object")

function checkType(value) {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  return typeof value;
  // TODO: implement
}

// Test cases (sau khi viết xong, kết quả phải đúng):
// checkType("hello")   -> "string"
// checkType(42)        -> "number"
// checkType(true)      -> "boolean"
// checkType(null)      -> "null"
// checkType(undefined) -> "undefined"
// checkType([1,2,3])   -> "array"
// checkType({a: 1})    -> "object"
