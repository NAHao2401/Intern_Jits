/**
 * Business logic layer cho todos
 *
 * Quy tắc:
 * - Service chứa TOÀN BỘ business logic
 * - Service throw Error khi gặp lỗi (kèm .statusCode)
 * - Service KHÔNG biết về req/res
 * - Controller gọi service, bắt lỗi, trả response
 */

const store = require("../data/todos.store");

/**
 * TODO: Implement getAllTodos(filter)
 *
 * - Gọi store.getAll(filter)
 * - Return array todos
 * - Không có business logic đặc biệt ở đây
 */
async function getAllTodos(filter) {
  // TODO: implement
  return store.getAll(filter);
}

/**
 * TODO: Implement getTodoById(id)
 *
 * - id phải là số nguyên dương -> nếu không: throw lỗi 400
 * - Gọi store.getById(id)
 * - Nếu không tìm thấy -> throw lỗi 404
 * - Return todo
 *
 * Cách throw lỗi với statusCode:
 * const err = new Error("Todo not found");
 * err.statusCode = 404;
 * throw err;
 */
async function getTodoById(id) {
  // TODO: implement
  const { todoId, todo } = getExistingTodo(id);

  return todo;
}

/**
 * TODO: Implement createTodo({ title, priority })
 *
 * - Gọi store.create({ title: title.trim(), priority })
 * - Return todo mới tạo
 */
async function createTodo({ title, priority }) {
  // TODO: implement
  return store.create({ title: title.trim(), priority });
}

/**
 * TODO: Implement updateTodo(id, data)
 *
 * - Validate id (số nguyên dương)
 * - Gọi store.getById(id) -> 404 nếu không tìm thấy
 * - Gọi store.update(id, data)
 * - Return todo đã update
 */
async function updateTodo(id, data) {
  // TODO: implement
  const { todoId, todo } = getExistingTodo(id);

  return store.update(todoId, data);
}

/**
 * TODO: Implement toggleComplete(id)
 *
 * - Validate id
 * - Tìm todo, 404 nếu không có
 * - Toggle todo.completed (true -> false, false -> true)
 * - Gọi store.update(id, { completed: !todo.completed })
 * - Return { todo, message } với message mô tả trạng thái mới
 */
async function toggleComplete(id) {
  // TODO: implement
  const { todoId, todo } = getExistingTodo(id);

  const updatedTodo = store.update(todoId, { completed: !todo.completed });

  return {
    todo: updatedTodo,
    message: updatedTodo.completed
      ? "Todo marked as completed"
      : "Todo marked as active",
  };
}

/**
 * TODO: Implement deleteTodo(id)
 *
 * - Validate id
 * - Gọi store.getById(id) -> 404 nếu không tìm thấy
 * - Gọi store.remove(id)
 * - Return true (hoặc { deleted: true })
 */
async function deleteTodo(id) {
  // TODO: implement
  const { todoId, todo } = getExistingTodo(id);

  store.remove(todoId);
  return true;
}

//Helper
function getExistingTodo(id) {
  const todoId = Number(id);

  if (!Number.isInteger(todoId) || todoId <= 0) {
    const err = new Error("Invalid todo id");
    err.statusCode = 400;
    throw err;
  }

  const todo = store.getById(todoId);

  if (!todo) {
    const err = new Error("Todo not found");
    err.statusCode = 404;
    throw err;
  }

  return { todoId, todo };
}

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleComplete,
  deleteTodo,
};
