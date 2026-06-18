/**
 * Data layer - In-memory store cho todos
 * Đây là nơi DUY NHẤT đọc/ghi dữ liệu
 * Service gọi store, không ai khác được trực tiếp thao tác mảng todos
 */

const { title } = require("node:process");
const { todo } = require("node:test");

let todos = [];
let nextId = 1;

const getAll = (filter = {}) => {
  let result = [...todos];

  // TODO: implement filter logic
  // - filter.status: "all" | "active" | "completed"
  // - filter.priority: "low" | "medium" | "high"
  // - filter.search: tìm trong title (case-insensitive)

  if (filter.status === "active") {
    result = result.filter((todo) => !todo.completed);
  } else if (filter.status === "completed") {
    result = result.filter((todo) => todo.completed);
  }

  if (filter.priority) {
    result = result.filter((todo) => todo.priority === filter.priority);
  }

  if (filter.search) {
    const keyword = filter.search.toLowerCase();

    result = result.filter((todo) =>
      todo.title.toLowerCase().includes(keyword),
    );
  }

  return result;
};

const getById = (id) => {
  // TODO: implement - trả về todo hoặc null
  return todos.find((todo) => todo.id === id) || null;
};

const create = (data) => {
  // TODO: implement
  // data gồm: { title, priority }
  // tự thêm: id, completed: false, createdAt: new Date()
  // push vào todos, return todo mới
  const todo = {
    id: nextId++,
    title: data.title,
    priority: data.priority,
    completed: false,
    createdAt: new Date(),
  };
  todos.push(todo);
  return todo;
};

const update = (id, data) => {
  // TODO: implement
  // - Tìm index theo id
  // - Nếu không tìm thấy -> return null
  // - Merge data vào todo hiện tại (chỉ update field có trong data)
  // - Thêm updatedAt: new Date()
  // - Return todo đã update
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return null;
  }

  todos[index] = {
    ...todos[index],
    ...data,
    updatedAt: new Date(),
  };

  return todos[index];
};

const remove = (id) => {
  // TODO: implement
  // - Tìm index theo id
  // - Nếu không tìm thấy -> return false
  // - splice khỏi mảng
  // - Return true
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return null;
  }

  todos.splice(index, 1);

  return true;
};

module.exports = { getAll, getById, create, update, remove };
