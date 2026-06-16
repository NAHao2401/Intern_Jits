/**
 * Homework: TODO App
 * Day 1 - Bài tập về nhà
 *
 * Xây dựng ứng dụng quản lý TODO chạy trên terminal
 * Dùng async/await cho tất cả operations (mô phỏng delay 200ms)
 */

// ============================================================
// Data store (in-memory)
// ============================================================

let todos = [];
let nextId = 1;

// Helper: mô phỏng async delay
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// Core functions - TODO: implement tất cả
// ============================================================

/**
 * Thêm todo mới
 * @param {string} title - Tiêu đề todo
 * @param {"low"|"medium"|"high"} priority - Độ ưu tiên
 * @returns {Promise<Object>} Todo vừa tạo
 */
async function addTodo(title, priority = "medium") {
  await delay();
  const validPriorities = ["low", "medium", "high"];
  // TODO: validate input (title không được rỗng, priority phải hợp lệ)
  if (!title || title.trim() === "") {
    throw new Error("Title cannot be empty");
  }
  if (!validPriorities.includes(priority)) {
    throw new Error(`Priority must be one of: ${validPriorities.join(", ")}`);
  }
  // TODO: tạo todo object với: id, title, priority, completed: false, createdAt: new Date()
  const todo = {
    id: nextId++,
    title,
    priority,
    completed: false,
    createdAt: new Date(),
  };
  // TODO: push vào mảng todos
  todos.push(todo);
  // TODO: return todo vừa tạo
  return todo;
}

/**
 * Đánh dấu todo đã hoàn thành
 * @param {number} id
 * @returns {Promise<Object>} Todo đã update
 */
async function completeTodo(id) {
  await delay();
  // TODO: tìm todo theo id, throw Error nếu không tìm thấy
  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    throw new Error(`Todo with id ${id} not found`);
  }
  // TODO: set completed = true
  todo.completed = true;
  // TODO: return todo đã update
  return todo;
}

/**
 * Xóa todo
 * @param {number} id
 * @returns {Promise<boolean>} true nếu xóa thành công
 */
async function deleteTodo(id) {
  await delay();
  // TODO: tìm index của todo theo id
  const index = todos.findIndex((t) => t.id === id);
  // TODO: throw Error nếu không tìm thấy
  if (index === -1) {
    throw new Error(`Todo with id ${id} not found`);
  }
  // TODO: xóa khỏi mảng dùng splice
  todos.splice(index, 1);
  // TODO: return true
  return true;
}

/**
 * Liệt kê todos
 * @param {"all"|"active"|"completed"} filter
 * @returns {Promise<Array>} Danh sách todos
 */
async function listTodos(filter = "all") {
  // TODO: dựa vào filter, trả về:
  // "all" -> tất cả
  // "active" -> chưa hoàn thành
  // "completed" -> đã hoàn thành
  if (filter === "active") {
    return todos.filter((t) => !t.completed);
  } else if (filter === "completed") {
    return todos.filter((t) => t.completed);
  }
  return todos;
}

/**
 * Tìm kiếm todos theo keyword trong title
 * @param {string} keyword
 * @returns {Promise<Array>} Danh sách todos khớp
 */
async function searchTodos(keyword) {
  // TODO: tìm todos có title chứa keyword (case-insensitive)
  return todos.filter((t) =>
    t.title.toLowerCase().includes(keyword.toLowerCase()),
  );
}

// ============================================================
// Display helper
// ============================================================

function displayTodo(todo) {
  const status = todo.completed ? "[x]" : "[ ]";
  const priority = { low: "LOW ", medium: "MED ", high: "HIGH" }[todo.priority];
  console.log(`  ${status} [${priority}] #${todo.id} - ${todo.title}`);
}

// ============================================================
// Main - Demo chạy thử các chức năng
// ============================================================

async function main() {
  await loadTodos();

  console.log("=== TODO APP ===\n");

  // Thêm todos
  console.log("Adding todos...");
  await addTodo("Học JavaScript cơ bản", "high");
  await addTodo("Đọc tài liệu Node.js", "high");
  await addTodo("Làm bài tập async/await", "medium");
  await addTodo("Setup VS Code extensions", "low");
  await addTodo("Push code lên GitHub", "medium");

  // Liệt kê tất cả
  console.log("\nAll todos:");
  const all = await listTodos("all");
  all.forEach(displayTodo);

  // Hoàn thành một todo
  console.log("\nCompleting todo #1...");
  await completeTodo(1);

  // Liệt kê active
  console.log("\nActive todos:");
  const active = await listTodos("active");
  active.forEach(displayTodo);

  // Tìm kiếm
  console.log("\nSearch 'node':");
  const results = await searchTodos("node");
  results.forEach(displayTodo);

  // Xóa todo
  console.log("\nDeleting todo #4...");
  await deleteTodo(4);

  // Liệt kê tất cả sau khi xóa
  console.log("\nAll todos after delete:");
  const remaining = await listTodos("all");
  remaining.forEach(displayTodo);

  // Test error handling
  console.log("\nTesting error handling...");
  try {
    await completeTodo(999);
  } catch (err) {
    console.log("Expected error:", err.message);
  }

  try {
    await addTodo("", "high");
  } catch (err) {
    console.log("Expected error:", err.message);
  }

  await saveTodos();
}

main().catch(console.error);

// ============================================================
// BONUS: Lưu/đọc từ file JSON (nếu làm xong phần trên)
// ============================================================

const fs = require("fs").promises;
const path = require("path");
const DATA_FILE = path.join(__dirname, "todos.json");

async function saveTodos() {
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
}

async function loadTodos() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    todos = JSON.parse(data);
    nextId = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
  } catch {
    todos = []; // file chưa tồn tại, bắt đầu với mảng rỗng
  }
}
