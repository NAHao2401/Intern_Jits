/**
 * Bài tập 2 - Express Routing
 * Day 2 - Express.js & REST API
 *
 * Mục tiêu:
 * - Dùng Express thay cho http module
 * - Đọc dữ liệu từ params, query string, body, headers
 * - Hiểu sự khác biệt giữa các cách truyền data
 * - Dùng express.Router() để nhóm routes
 *
 * Chạy: node 02-express-routing.js
 * Test: curl http://localhost:3002/...
 */

const express = require("express");
const app = express();
const PORT = 3002;

// Middleware parse JSON body
app.use(express.json());

// ============================================================
// 2.1: Route cơ bản
// ============================================================

/**
 * TODO: Implement các route sau:
 *
 * GET /ping
 * -> 200 { message: "pong", timestamp: new Date().toISOString() }
 *
 * GET /hello/:name
 * -> 200 { message: "Hello, <name>!" }
 * -> Nếu name là "error" -> 400 { error: "Name cannot be 'error'" }
 *
 * GET /math/add?a=5&b=3
 * -> 200 { result: 8, operation: "add" }
 * -> Validate: a và b phải là số hợp lệ
 * -> Nếu không hợp lệ -> 400 { error: "a and b must be valid numbers" }
 *
 * POST /echo
 * -> 200, echo lại body nhận được + thêm field "receivedAt": new Date()
 * -> Nếu không có body -> 400 { error: "Request body is required" }
 */

// TODO 2.1.1: GET /ping
app.get("/ping", (req, res) => {
  // Implement ở đây
  res.json({ message: "pong", timestamp: new Date().toISOString() });
});

// TODO 2.1.2: GET /hello/:name
app.get("/hello/:name", (req, res) => {
  // Implement ở đây
  // Hint: req.params.name
  const { name } = req.params;
  if (name === "error") {
    return res.status(400).json({ error: "Name cannot be 'error'" });
  }
  res.json({ message: `Hello, ${name}!` });
});

// TODO 2.1.3: GET /math/add?a=5&b=3
app.get("/math/add", (req, res) => {
  // Implement ở đây
  // Hint: req.query.a, req.query.b (đều là string, cần convert sang số)
  // Dùng Number() hoặc parseFloat() để convert
  // isNaN() để validate
  const a = Number(req.query.a);
  const b = Number(req.query.b);
  if (isNaN(a) || isNaN(b)) {
    return res.status(400).json({ error: "a and b must be valid numbers" });
  }
  const result = a + b;
  res.json({ result, operation: "add" });
});

// TODO 2.1.4: POST /echo
app.post("/echo", (req, res) => {
  // Implement ở đây
  // Hint: Object.keys(req.body).length === 0 để check body rỗng
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is required" });
  }
  res.json({ ...req.body, receivedAt: new Date() });
});

// ============================================================
// 2.2: Route Params nâng cao
// ============================================================

/**
 * TODO: Implement các route xử lý params phức tạp hơn:
 *
 * GET /users/:userId/posts/:postId
 * -> 200 {
 *      userId: <number>,
 *      postId: <number>,
 *      message: "Fetching post <postId> of user <userId>"
 *    }
 * -> Validate cả userId và postId phải là số nguyên dương
 *
 * GET /files/*
 * -> 200 { path: <phần path sau /files/>, segments: <array các phần> }
 * -> Ví dụ: GET /files/images/2024/photo.jpg
 * ->        { path: "images/2024/photo.jpg", segments: ["images", "2024", "photo.jpg"] }
 */

// TODO 2.2.1: GET /users/:userId/posts/:postId
app.get("/users/:userId/posts/:postId", (req, res) => {
  // Implement ở đây
  const { userId, postId } = req.params;
  const userIdNum = Number(userId);
  const postIdNum = Number(postId);
  if (
    isNaN(userIdNum) ||
    isNaN(postIdNum) ||
    userIdNum <= 0 ||
    postIdNum <= 0 ||
    !Number.isInteger(userIdNum) ||
    !Number.isInteger(postIdNum)
  ) {
    return res
      .status(400)
      .json({ error: "userId and postId must be positive integers" });
  }
  res.json({
    userId: userIdNum,
    postId: postIdNum,
    message: `Fetching post ${postIdNum} of user ${userIdNum}`,
  });
});

// TODO 2.2.2: GET /files/* (wildcard route)
app.get("/files/*", (req, res) => {
  // Implement ở đây
  // Hint: req.params[0] chứa phần wildcard
  const path = req.params[0];
  const segments = path.split("/").filter(Boolean).json(", ");
  res.json({ path, segments });
});

// ============================================================
// 2.3: Query String nâng cao
// ============================================================

/**
 * Data mẫu cho bài này:
 */
const books = [
  {
    id: 1,
    title: "Clean Code",
    author: "Robert Martin",
    genre: "tech",
    year: 2008,
    price: 350000,
  },
  {
    id: 2,
    title: "The Pragmatic Programmer",
    author: "David Thomas",
    genre: "tech",
    year: 1999,
    price: 420000,
  },
  {
    id: 3,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "history",
    year: 2011,
    price: 280000,
  },
  {
    id: 4,
    title: "Atomic Habits",
    author: "James Clear",
    genre: "self-help",
    year: 2018,
    price: 230000,
  },
  {
    id: 5,
    title: "Dune",
    author: "Frank Herbert",
    genre: "fiction",
    year: 1965,
    price: 190000,
  },
];

/**
 * TODO: Implement GET /books với các query string sau:
 *
 * Các query params được hỗ trợ:
 * - genre    : lọc theo genre (ví dụ: ?genre=tech)
 * - minPrice : lọc giá >= minPrice
 * - maxPrice : lọc giá <= maxPrice
 * - sort     : sắp xếp theo field (title, year, price)
 * - order    : "asc" (mặc định) hoặc "desc"
 * - search   : tìm kiếm theo title (case-insensitive)
 *
 * Response:
 * {
 *   "data": [...],
 *   "total": <số lượng kết quả sau filter>,
 *   "filters": { <các filter đang áp dụng> }
 * }
 *
 * Ví dụ:
 * GET /books?genre=tech&sort=price&order=asc
 * GET /books?minPrice=200000&maxPrice=400000&sort=year&order=desc
 * GET /books?search=code
 */
app.get("/books", (req, res) => {
  // Implement ở đây
  // Bước 1: Lấy các query params
  const { genre, minPrice, maxPrice, sort, order, search } = req.query;

  // Bước 2: Filter
  let result = [...books];
  if (genre) {
    result = result.filter((book) => book.genre === genre);
  }
  if (minPrice) {
    const minPriceNum = Number(minPrice);
    if (!isNaN(minPriceNum)) {
      result = result.filter((book) => book.price >= minPriceNum);
    }
  }
  if (maxPrice) {
    const maxPriceNum = Number(maxPrice);
    if (!isNaN(maxPriceNum)) {
      result = result.filter((book) => book.price <= maxPriceNum);
    }
  }
  if (search) {
    const searchTerm = search.toLowerCase();
    result = result.filter((book) =>
      book.title.toLowerCase().includes(searchTerm),
    );
  }

  // Bước 3: Sort
  if (sort) {
    const sortOrder = order === "desc" ? -1 : 1;
    result.sort((a, b) => {
      if (a[sort] < b[sort]) return -1 * sortOrder;
      if (a[sort] > b[sort]) return 1 * sortOrder;
      return 0;
    });
  }

  // Bước 4: Trả về response
  res.json({
    data: result,
    total: result.length,
    filters: {
      genre,
      minPrice,
      maxPrice,
      sort,
      order,
      search,
    },
  });
});

// ============================================================
// 2.4: Request Headers
// ============================================================

/**
 * TODO: Implement các route làm việc với headers:
 *
 * GET /headers/info
 * -> 200, trả về thông tin từ headers:
 *    {
 *      userAgent: req.headers["user-agent"],
 *      acceptLanguage: req.headers["accept-language"],
 *      customHeader: req.headers["x-custom-header"] || null,
 *      allHeaders: req.headers
 *    }
 *
 * GET /headers/accept
 * -> Check header "Accept":
 *    - Nếu client accept "application/json" -> res.json({ data: "JSON response" })
 *    - Nếu client accept "text/plain" -> res.type("text").send("Plain text response")
 *    - Khác -> 406 Not Acceptable
 *
 * POST /headers/auth
 * -> Check header "X-API-Key":
 *    - Nếu không có -> 401 { error: "Missing X-API-Key header" }
 *    - Nếu key === "secret123" -> 200 { message: "Authenticated!", key: key }
 *    - Khác -> 401 { error: "Invalid API key" }
 */

// TODO 2.4.1: GET /headers/info
app.get("/headers/info", (req, res) => {
  // Implement ở đây
  const userAgent = req.headers["user-agent"] || null;
  const acceptLanguage = req.headers["accept-language"] || null;
  const customHeader = req.headers["x-custom-header"] || null;
  res.json({
    userAgent,
    acceptLanguage,
    customHeader,
    allHeaders: req.headers,
  });
});

// TODO 2.4.2: GET /headers/accept
app.get("/headers/accept", (req, res) => {
  // Implement ở đây
  // Hint: req.headers.accept hoặc req.get("Accept")
  // Hint: .includes("application/json")
  const acceptHeader = req.headers["accept"] || "";
  if (acceptHeader.includes("application/json")) {
    res.json({ data: "JSON response" });
  } else if (acceptHeader.includes("text/plain")) {
    res.type("text").send("Plain text response");
  } else {
    res.status(406).json({ error: "Not Acceptable" });
  }
});

// TODO 2.4.3: POST /headers/auth
app.post("/headers/auth", (req, res) => {
  // Implement ở đây
  // Hint: req.get("X-API-Key") hoặc req.headers["x-api-key"]
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(401).json({ error: "Missing X-API-Key header" });
  }
  if (apiKey === "secret123") {
    return res.json({ message: "Authenticated!", key: apiKey });
  }
  res.status(401).json({ error: "Invalid API key" });
});

// ============================================================
// 2.5: express.Router()
// ============================================================

/**
 * TODO: Refactor các route /books thành một Router riêng
 * và các route /users/:id thành một Router riêng
 *
 * Cấu trúc:
 * - booksRouter: GET /, GET /:id, POST /, DELETE /:id
 * - usersRouter: GET /, GET /:id, POST /
 *
 * Mount tại: /api/v2/books và /api/v2/users
 */

const booksRouter = express.Router();
const usersRouter = express.Router();

// In-memory data
const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

// TODO 2.5.1: booksRouter
// GET /      -> lấy tất cả books (copy logic filter từ 2.3)
booksRouter.get("/", (req, res) => {
  // Implement ở đây
  // Bước 1: Lấy các query params
  const { genre, minPrice, maxPrice, sort, order, search } = req.query;

  // Bước 2: Filter
  let result = [...books];
  if (genre) {
    result = result.filter((book) => book.genre === genre);
  }
  if (minPrice) {
    const minPriceNum = Number(minPrice);
    if (!isNaN(minPriceNum)) {
      result = result.filter((book) => book.price >= minPriceNum);
    }
  }
  if (maxPrice) {
    const maxPriceNum = Number(maxPrice);
    if (!isNaN(maxPriceNum)) {
      result = result.filter((book) => book.price <= maxPriceNum);
    }
  }
  if (search) {
    const searchTerm = search.toLowerCase();
    result = result.filter((book) =>
      book.title.toLowerCase().includes(searchTerm),
    );
  }

  // Bước 3: Sort
  if (sort) {
    const sortOrder = order === "desc" ? -1 : 1;
    result.sort((a, b) => {
      if (a[sort] < b[sort]) return -1 * sortOrder;
      if (a[sort] > b[sort]) return 1 * sortOrder;
      return 0;
    });
  }

  // Bước 4: Trả về response
  res.json({
    data: result,
    total: result.length,
    filters: {
      genre,
      minPrice,
      maxPrice,
      sort,
      order,
      search,
    },
  });
});

// GET /:id   -> lấy book theo id, 404 nếu không tìm thấy
booksRouter.get("/:id", (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }
  res.json({ data: book });
});

// POST /     -> tạo book mới (validate: title và author là bắt buộc)
booksRouter.post("/", (req, res) => {
  const { title, author, genre, year, price } = req.body;
  if (!title || !author) {
    return res
      .status(400)
      .json({ error: "Title and author are required fields" });
  }
  const newBook = {
    id: books.length + 1,
    title,
    author,
    genre: genre || "unknown",
    year: year || null,
    price: price || null,
  };
  books.push(newBook);
  res.status(201).json({ data: newBook });
});

// DELETE /:id -> xóa book, 404 nếu không tìm thấy
booksRouter.delete("/:id", (req, res) => {
  const bookIndex = books.findIndex((b) => b.id === parseInt(req.params.id));
  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found" });
  }
  books.splice(bookIndex, 1);
  res.json({ message: "Book deleted successfully" });
});

// TODO 2.5.2: usersRouter
// GET /      -> lấy tất cả users
usersRouter.get("/", (req, res) => {
  res.json({ data: users });
});

// GET /:id   -> lấy user theo id
usersRouter.get("/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ data: user });
});

// POST /     -> tạo user mới (validate: name và email bắt buộc, email phải có @)
usersRouter.post("/", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res
      .status(400)
      .json({ error: "Name and email are required fields" });
  }
  if (!email.includes("@")) {
    return res.status(400).json({ error: "Email must be valid" });
  }
  const newUser = {
    id: users.length + 1,
    name,
    email,
  };
  users.push(newUser);
  res.status(201).json({ data: newUser });
});

// Mount routers
app.use("/api/v2/books", booksRouter);
app.use("/api/v2/users", usersRouter);

// ============================================================
// 404 và Error Handler
// ============================================================

app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.statusCode || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// ============================================================
// Start server
// ============================================================

app.listen(PORT, () => {
  console.log(`Express Routing server running on http://localhost:${PORT}`);
  console.log("\nTest các endpoint sau:");
  console.log(`  curl http://localhost:${PORT}/ping`);
  console.log(`  curl http://localhost:${PORT}/hello/Alice`);
  console.log(`  curl "http://localhost:${PORT}/math/add?a=5&b=3"`);
  console.log(
    `  curl -X POST http://localhost:${PORT}/echo -H "Content-Type: application/json" -d '{"key":"value"}'`,
  );
  console.log(`  curl http://localhost:${PORT}/users/1/posts/42`);
  console.log(`  curl http://localhost:${PORT}/files/images/2024/photo.jpg`);
  console.log(
    `  curl "http://localhost:${PORT}/books?genre=tech&sort=price&order=asc"`,
  );
  console.log(`  curl http://localhost:${PORT}/headers/info`);
  console.log(
    `  curl -X POST http://localhost:${PORT}/headers/auth -H "X-API-Key: secret123"`,
  );
  console.log(`  curl http://localhost:${PORT}/api/v2/books`);
  console.log(`  curl http://localhost:${PORT}/api/v2/users`);
});
