/**
 * Bài 2: Function & Array Methods
 * Day 1 - JavaScript Cơ bản
 */

// ============================================================
// Bài 2.1: Viết function theo 3 cách
// ============================================================

// TODO: Tính diện tích hình chữ nhật - viết theo 3 cách:
// a) Function declaration
function calculateArea(length, width) {
  return length * width;
}
// b) Function expression
const calculateArea2 = function (length, width) {
  return length * width;
};
// c) Arrow function
const calculateArea3 = (length, width) => length * width;

// TODO: Kiểm tra số chẵn lẻ - viết theo 3 cách
function isEven(num) {
  return num % 2 === 0;
}

const isEven2 = function (num) {
  return num % 2 === 0;
};

const isEven3 = (num) => num % 2 === 0;

// TODO: Đảo ngược chuỗi - viết theo 3 cách
// Gợi ý: str.split("").reverse().join("")
function reverseString(str) {
  return str.split("").reverse().join("");
}

const reverseString2 = function (str) {
  return str.split("").reverse().join("");
};

const reverseString3 = (str) => str.split("").reverse().join("");
// ============================================================
// Bài 2.2: Array methods
// ============================================================

const products = [
  { id: 1, name: "Laptop", price: 25000000, category: "tech", inStock: true },
  { id: 2, name: "Phone", price: 15000000, category: "tech", inStock: false },
  { id: 3, name: "Desk", price: 5000000, category: "furniture", inStock: true },
  {
    id: 4,
    name: "Chair",
    price: 3000000,
    category: "furniture",
    inStock: true,
  },
  { id: 5, name: "Monitor", price: 8000000, category: "tech", inStock: true },
];

// a) Lấy danh sách tên tất cả sản phẩm (dùng map)
// TODO:
const allNames = products.map((p) => p.name); // thay null bằng code của bạn

// b) Lọc sản phẩm còn hàng (dùng filter)
// TODO:
const inStockProducts = products.filter((p) => p.inStock); // thay null bằng code của bạn

// c) Lọc sản phẩm category "tech" VÀ còn hàng (dùng filter)
// TODO:
const techInStock = products.filter((p) => p.category === "tech" && p.inStock); // thay null bằng code của bạn

// d) Tính tổng giá trị tất cả sản phẩm còn hàng (dùng filter + reduce)
// TODO:
const totalValue = products
  .filter((p) => p.inStock)
  .reduce((sum, p) => sum + p.price, 0);

// e) Tìm sản phẩm đắt nhất (dùng reduce)
// TODO:
const mostExpensive = products.reduce(
  (max, p) => (p.price > max.price ? p : max),
  products[0],
);

// f) Sắp xếp sản phẩm theo giá tăng dần (dùng sort - chú ý không mutate mảng gốc)
// TODO:
const sortedByPrice = [...products].sort((a, b) => a.price - b.price);

// Log tất cả kết quả để kiểm tra
console.log("All names:", allNames);
console.log(
  "In stock:",
  inStockProducts?.map((p) => p.name),
);
console.log(
  "Tech in stock:",
  techInStock?.map((p) => p.name),
);
console.log("Total value:", totalValue?.toLocaleString("vi-VN"), "VND");
console.log("Most expensive:", mostExpensive?.name);
console.log(
  "Sorted:",
  sortedByPrice?.map((p) => `${p.name}: ${p.price}`),
);

// ============================================================
// Bài 2.3: Destructuring trong function
// ============================================================

// TODO: Viết function printUserInfo nhận vào object user có cấu trúc:
// { firstName, lastName, age, address: { city, district } }
// Log ra: "Nguyen Van A (25 tuoi) - Quan 1, HCM"
// Dùng destructuring trong parameter của function

function printUserInfo(user) {
  // TODO: destructure và log
  const {
    firstName,
    lastName,
    age,
    address: { city, district },
  } = user;
  console.log(`${lastName} ${firstName} (${age} tuoi) - ${district}, ${city}`);
}

// Test:
printUserInfo({
  firstName: "Van A",
  lastName: "Nguyen",
  age: 25,
  address: { city: "HCM", district: "Quan 1" },
});
// Expected: "Nguyen Van A (25 tuoi) - Quan 1, HCM"
