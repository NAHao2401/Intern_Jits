# Day 3 - Validation, Authentication & Project Structure

**Mục tiêu:** Bảo vệ API bằng input validation và JWT authentication, tổ chức code theo chuẩn production

Sau Day 3, thực tập sinh có thể:
- Validate input request với `joi` và trả về lỗi rõ ràng
- Giải thích JWT hoạt động thế nào (header, payload, signature)
- Implement đăng ký / đăng nhập trả về access token
- Viết `authenticate` middleware kiểm tra JWT trên từng route được bảo vệ
- Hash password bằng `bcrypt` (không lưu plaintext bao giờ)
- Tổ chức project theo kiến trúc controller / service / router
- Hiểu sự khác biệt giữa authentication và authorization

---

## Câu hỏi tìm hiểu trước

Trước khi học, tìm hiểu và trả lời các câu hỏi sau. Không cần đúng hoàn toàn — mục tiêu là có hình dung ban đầu trước khi đào sâu.

**Validation**
- Input validation là gì? Tại sao phải validate ở server dù client đã validate rồi?
- Schema validation là gì, khác kiểm tra thủ công `if (!req.body.email)` ở điểm nào?
- `joi` là gì? Ngoài `joi` còn thư viện nào khác làm validation trong Node.js?

**Authentication vs Authorization**
- Authentication (xác thực) nghĩa là gì?
- Authorization (phân quyền) nghĩa là gì?
- Hai khái niệm này khác nhau ra sao? Cho ví dụ thực tế.
- Session-based auth và token-based auth khác nhau thế nào?

**JWT - JSON Web Token**
- JWT là gì? Gồm mấy phần, tên từng phần?
- JWT được ký (signed) bằng cơ chế nào?
- JWT có thể bị giải mã bởi bất kỳ ai không? Điều đó có nghĩa gì?
- Access token và refresh token khác nhau để làm gì?
- JWT stateless nghĩa là gì? Ưu và nhược điểm so với session?

**Password Security**
- Tại sao không lưu password dạng plaintext vào database?
- Hash khác encrypt ở điểm nào?
- Bcrypt là gì? `salt` và `cost factor` trong bcrypt dùng để làm gì?
- `rainbow table attack` là gì, bcrypt ngăn chặn nó thế nào?

**Project Structure**
- MVC pattern là gì (Model, View, Controller)?
- Controller và Service khác nhau vai trò thế nào?
- Tại sao tách business logic ra khỏi route handler?

---

## Phần 0 - Chuẩn bị

Cài dependencies cho Day 3:

```bash
npm install joi jsonwebtoken bcrypt dotenv
npm install --save-dev nodemon
```

Tạo file `.env` trong thư mục project:

```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

Tạo file `.gitignore` (nếu chưa có):

```
node_modules/
.env
```

**Quan trọng:** `.env` chứa secret key — không bao giờ commit lên git.

Kiểm tra:

```bash
node -e "require('joi'); require('jsonwebtoken'); require('bcrypt'); console.log('OK')"
```

---

## Phần 1 - Input Validation với Joi

### Tại sao cần validation ở server?

```
Client gửi: POST /api/users
Body: { "email": "không phải email", "age": -5, "name": "" }

Không validate -> data xấu vào database -> bug khó tìm về sau
Validate đúng -> trả lỗi ngay, rõ ràng, data sạch
```

**Quy tắc bất di bất dịch:** Không tin bất kỳ dữ liệu nào đến từ client. Validate tất cả.

### Joi Basics

```javascript
const Joi = require("joi");

// Định nghĩa schema
const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(18).max(120).optional(),
  role: Joi.string().valid("admin", "user", "moderator").default("user"),
});

// Validate
const { error, value } = userSchema.validate({ name: "Alice", email: "alice@example.com" });

if (error) {
  console.log(error.details[0].message); // "\"email\" must be a valid email"
} else {
  console.log(value); // { name: "Alice", email: "alice@example.com", role: "user" }
}
```

### Các rule Joi hay dùng

```javascript
const Joi = require("joi");

// String
Joi.string().min(1).max(255).trim().required()
Joi.string().email()
Joi.string().uri()
Joi.string().pattern(/^[a-zA-Z0-9_]+$/)  // regex
Joi.string().valid("active", "inactive")   // enum

// Number
Joi.number().integer().min(0).max(100)
Joi.number().positive()

// Boolean
Joi.boolean()

// Array
Joi.array().items(Joi.string()).min(1)

// Object lồng nhau
const addressSchema = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  zipCode: Joi.string().pattern(/^\d{5}$/).required(),
});

const userSchema = Joi.object({
  name: Joi.string().required(),
  address: addressSchema.required(),
});

// Date
Joi.date().iso()  // ISO 8601: "2024-01-15"
Joi.date().min("now")  // không cho phép ngày trong quá khứ
```

### Validation Middleware — cách đúng

Tách validation ra middleware, tái sử dụng được:

```javascript
// middleware/validate.js
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,    // trả về tất cả lỗi, không dừng ở lỗi đầu tiên
      stripUnknown: true,   // bỏ field lạ không có trong schema
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      }));
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    req.body = value; // gán lại body đã được sanitize
    next();
  };
};

module.exports = validate;
```

```javascript
// schemas/user.schema.js
const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid("admin", "user").default("user"),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim(),
  email: Joi.string().email().lowercase(),
}).min(1); // phải có ít nhất 1 field

module.exports = { createUserSchema, updateUserSchema };
```

```javascript
// routes/users.js
const router = require("express").Router();
const validate = require("../middleware/validate");
const { createUserSchema, updateUserSchema } = require("../schemas/user.schema");
const usersController = require("../controllers/users.controller");

router.get("/", usersController.getAll);
router.post("/", validate(createUserSchema), usersController.create);
router.put("/:id", validate(updateUserSchema), usersController.update);
```

### Bài tập 1 - `exercises/01-validation/`

```javascript
// Tạo file exercises/01-validation/index.js
// Khởi động Express server port 3001

// Bài 1.1: Schema cơ bản
// Tạo POST /api/products với validation schema:
// - name: string, 2-100 ký tự, bắt buộc
// - price: number, > 0, bắt buộc
// - category: "tech" | "furniture" | "clothing", bắt buộc
// - inStock: boolean, mặc định true
// - description: string, max 500 ký tự, không bắt buộc
// Test các case: thiếu field, giá âm, category sai

// Bài 1.2: Validation query params
// Thêm validate cho GET /api/products?page=1&limit=10&sort=price_asc
// - page: integer, min 1, default 1
// - limit: integer, min 1, max 100, default 10
// - sort: "price_asc" | "price_desc" | "name_asc", không bắt buộc
// Gợi ý: validate req.query thay vì req.body

// Bài 1.3: Nested validation
// Tạo POST /api/orders với schema:
// - customerId: number, integer, bắt buộc
// - items: array tối thiểu 1 phần tử, mỗi item gồm:
//   - productId: number, integer, bắt buộc
//   - quantity: integer, min 1, max 99, bắt buộc
// - shippingAddress: object gồm:
//   - street: string, bắt buộc
//   - city: string, bắt buộc
// Test với items rỗng, quantity = 0, thiếu address
```

---

## Phần 2 - Password Hashing với Bcrypt

### Tại sao không lưu plaintext password?

```
Nếu database bị leak:
- Plaintext  -> attacker có ngay password của tất cả users
- MD5/SHA1   -> rainbow table crack được nhanh
- Bcrypt     -> mỗi hash khác nhau (do salt), cực chậm để brute force
```

### Bcrypt hoạt động thế nào

```javascript
const bcrypt = require("bcrypt");

// HASH password khi đăng ký
async function hashPassword(plaintext) {
  const saltRounds = 10; // cost factor: 2^10 = 1024 vòng lặp
  const hash = await bcrypt.hash(plaintext, saltRounds);
  return hash;
  // "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
  // "$2b$" -> algorithm
  // "10$"  -> cost factor
  // tiếp theo 22 ký tự -> salt (tự động tạo ngẫu nhiên)
  // còn lại -> hash
}

// VERIFY password khi đăng nhập
async function verifyPassword(plaintext, hash) {
  const match = await bcrypt.compare(plaintext, hash);
  return match; // true hoặc false
}

// Ví dụ sử dụng
async function demo() {
  const password = "MySecretPassword123";
  const hash = await hashPassword(password);
  console.log("Hash:", hash);

  const valid = await verifyPassword("MySecretPassword123", hash);
  console.log("Valid:", valid); // true

  const invalid = await verifyPassword("wrongpassword", hash);
  console.log("Invalid:", invalid); // false
}
```

**Lưu ý về saltRounds:**
- `10` — mặc định, đủ cho hầu hết dự án (~100ms)
- `12` — bảo mật cao hơn (~400ms)
- Không dùng dưới `10`

---

## Phần 3 - JWT Authentication

### JWT là gì?

JWT (JSON Web Token) gồm 3 phần ngăn cách bằng dấu `.`:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAzNjAwfQ.HMAC_SIGNATURE_HERE

1. Header  (base64url): { "alg": "HS256", "typ": "JWT" }
2. Payload (base64url): { "userId": 1, "email": "alice@example.com", "role": "user", "iat": 1700000000, "exp": 1700003600 }
3. Signature: HMACSHA256(base64url(header) + "." + base64url(payload), SECRET_KEY)
```

**Quan trọng:**
- Header và Payload **không được mã hóa** — ai cũng decode được
- Signature **không thể giả mạo** nếu không có SECRET_KEY
- Không lưu thông tin nhạy cảm (password, credit card) trong payload

### Tạo và Verify JWT

```javascript
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

// Tạo token
function generateToken(payload) {
  return jwt.sign(payload, SECRET, {
    expiresIn: "1h",         // token hết hạn sau 1 giờ
    issuer: "my-api",        // tùy chọn
  });
}

// Verify token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded;
    // { userId: 1, email: "alice@example.com", role: "user", iat: ..., exp: ... }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw err;
  }
}
```

### Authentication Flow đầy đủ

```
ĐĂNG KÝ:
Client                          Server
  |  POST /api/auth/register       |
  |  { name, email, password }     |
  | -----------------------------> |
  |                                | 1. Validate input
  |                                | 2. Kiểm tra email đã tồn tại chưa
  |                                | 3. Hash password bằng bcrypt
  |                                | 4. Lưu user vào database/memory
  |  { success: true, data: user } |
  | <----------------------------- |

ĐĂNG NHẬP:
Client                          Server
  |  POST /api/auth/login          |
  |  { email, password }           |
  | -----------------------------> |
  |                                | 1. Tìm user theo email
  |                                | 2. Verify password với bcrypt
  |                                | 3. Tạo JWT với userId, role
  |  { token: "eyJ..." }           |
  | <----------------------------- |

GỌI ROUTE BẢO VỆ:
Client                          Server
  |  GET /api/users/me             |
  |  Authorization: Bearer eyJ..   |
  | -----------------------------> |
  |                                | 1. Middleware: lấy token từ header
  |                                | 2. Verify token
  |                                | 3. Gán req.user = decoded payload
  |                                | 4. next() -> route handler chạy
  |  { success: true, data: user } |
  | <----------------------------- |
```

### Implement Auth Routes

```javascript
// routes/auth.js
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");

// In-memory users store (Day 3 dùng tạm, Day 4+ sẽ dùng database)
let users = [];
let nextId = 1;

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email đã tồn tại
    const existing = users.find((u) => u.email === email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user (không trả password về client)
    const user = {
      id: nextId++,
      name,
      email,
      password: hashedPassword, // lưu hash, không bao giờ lưu plaintext
      role: "user",
      createdAt: new Date(),
    };
    users.push(user);

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Tìm user
    const user = users.find((u) => u.email === email);
    if (!user) {
      // Trả cùng một message để tránh user enumeration attack
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Tạo JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({
      success: true,
      data: { token, expiresIn: "1h" },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

### Authentication Middleware

```javascript
// middleware/authenticate.js
const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  // Lấy token từ header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Provide Bearer token.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // gán user info vào request, dùng ở route handler
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired. Please login again.",
      });
    }
    return res.status(401).json({
      success: false,
      error: "Invalid token.",
    });
  }
}

module.exports = authenticate;
```

### Authorization — phân quyền theo role

```javascript
// middleware/authorize.js

// Factory function: nhận list role được phép
function authorize(...roles) {
  return (req, res, next) => {
    // authenticate phải chạy trước authorize
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to perform this action",
      });
    }

    next();
  };
}

module.exports = authorize;
```

```javascript
// Dùng trong route
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// Chỉ cần đăng nhập
router.get("/profile", authenticate, getProfile);

// Cần đăng nhập VÀ phải là admin
router.delete("/:id", authenticate, authorize("admin"), deleteUser);

// Admin hoặc moderator
router.patch("/:id/status", authenticate, authorize("admin", "moderator"), updateStatus);
```

### Schemas cho Auth

```javascript
// schemas/auth.schema.js
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least 1 uppercase, 1 lowercase, and 1 number",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
```

### Bài tập 2 - `exercises/02-auth/`

```javascript
// Tạo Express app với auth đầy đủ:

// 2.1: Register + Login
// Implement POST /api/auth/register và POST /api/auth/login
// Yêu cầu:
// - Validate input với joi
// - Hash password với bcrypt (saltRounds = 10)
// - Login trả về JWT token
// Test:
// - Đăng ký thành công -> 201
// - Đăng ký email trùng -> 409
// - Đăng nhập đúng -> 200 + token
// - Đăng nhập sai password -> 401
// - Đăng nhập email không tồn tại -> 401

// 2.2: Protected routes
// Implement:
// GET /api/users/me    -> trả về thông tin user hiện tại (từ req.user)
// PUT /api/users/me    -> update name của user hiện tại
// Yêu cầu: phải có token hợp lệ, token hết hạn -> 401

// 2.3: Role-based authorization
// Thêm route chỉ admin mới được dùng:
// GET  /api/admin/users     -> lấy danh sách tất cả users
// DELETE /api/admin/users/:id -> xóa user
// Test: user thường gọi -> 403, admin gọi -> 200

// Gợi ý flow test bằng Postman/Thunder Client:
// 1. POST /api/auth/register { name, email, password }
// 2. POST /api/auth/login { email, password } -> lấy token
// 3. GET /api/users/me với header Authorization: Bearer <token>
// 4. Thử gọi không có token -> xem lỗi gì
// 5. Thử gọi với token hết hạn (sửa tạm JWT_EXPIRES_IN=1s để test)
```

---

## Phần 4 - Project Structure nâng cao

### Tại sao cần tổ chức code?

```javascript
// Cách làm sai - tất cả logic trong route handler
router.post("/api/users", async (req, res) => {
  // validate
  // kiểm tra email trùng
  // hash password
  // lưu vào database
  // gửi email chào mừng
  // tạo activity log
  // trả response
  // -> 100 dòng trong 1 function, không test được, không tái sử dụng được
});

// Cách đúng - tách thành layer
// Route Handler: nhận request, gọi service, trả response
// Service: business logic (kiểm tra email, hash password, gọi repository)
// Repository (hoặc Data layer): đọc/ghi dữ liệu
```

### Cấu trúc project chuẩn

```
src/
├── index.js              <- Entry point: khởi động server
├── app.js                <- Cấu hình Express app (tách khỏi server start)
├── routes/
│   ├── index.js          <- Mount tất cả routers
│   ├── auth.routes.js    <- POST /auth/register, POST /auth/login
│   └── users.routes.js   <- CRUD users
├── controllers/
│   ├── auth.controller.js   <- Nhận req, gọi service, trả res
│   └── users.controller.js
├── services/
│   ├── auth.service.js      <- Business logic: register, login
│   └── users.service.js     <- Business logic: tìm, tạo, sửa, xóa user
├── middleware/
│   ├── validate.js          <- Joi validation middleware
│   ├── authenticate.js      <- JWT verify middleware
│   ├── authorize.js         <- Role check middleware
│   └── errorHandler.js      <- Global error handler
├── schemas/
│   ├── auth.schema.js       <- Joi schemas cho auth
│   └── users.schema.js      <- Joi schemas cho users
└── data/
    └── users.store.js       <- In-memory data (Day 3), thay bằng DB sau
```

### Ví dụ Controller / Service tách biệt

```javascript
// services/auth.service.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersStore = require("../data/users.store");

async function register({ name, email, password }) {
  // Business logic ở đây
  const existing = usersStore.findByEmail(email);
  if (existing) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = usersStore.create({ name, email, password: hashedPassword, role: "user" });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function login({ email, password }) {
  const user = usersStore.findByEmail(email);

  // Không phân biệt email sai hay password sai -> ngăn user enumeration
  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );

  return { token, expiresIn: "1h" };
}

module.exports = { register, login };
```

```javascript
// controllers/auth.controller.js
const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err); // service throw lỗi -> error middleware xử lý
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
```

```javascript
// app.js
require("dotenv").config();
const express = require("express");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
```

```javascript
// index.js
const app = require("./app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Tại sao tách `app.js` và `index.js`?**
- `app.js` export Express app -> dễ import trong test (`const app = require('./app')`)
- `index.js` chỉ start server -> test không cần start server thật

### Bài tập 3 - `exercises/03-project-structure/`

```
Refactor lại TODO API từ bài tập về nhà Day 2 theo cấu trúc mới:

Cấu trúc mục tiêu:
exercises/03-project-structure/
├── src/
│   ├── index.js
│   ├── app.js
│   ├── routes/
│   │   ├── index.js
│   │   └── todos.routes.js
│   ├── controllers/
│   │   └── todos.controller.js
│   ├── services/
│   │   └── todos.service.js
│   ├── middleware/
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── schemas/
│   │   └── todo.schema.js
│   └── data/
│       └── todos.store.js
└── package.json

Yêu cầu:
- Controller chỉ gọi service và trả response, không có business logic
- Service chứa toàn bộ business logic (kiểm tra todo tồn tại, throw lỗi rõ ràng)
- Validate input với Joi (title bắt buộc, priority enum, completed boolean)
- Error handler middleware bắt tất cả lỗi từ service
```

---

## Bài tập về nhà - `homework/`

Xây dựng **Notes API** có xác thực đầy đủ, theo cấu trúc controller/service.

### Yêu cầu chức năng

**Auth endpoints:**
- `POST /api/auth/register` — đăng ký (name, email, password)
- `POST /api/auth/login` — đăng nhập, trả về JWT token

**Notes endpoints (cần đăng nhập):**
- `GET /api/notes` — lấy tất cả notes của user đang đăng nhập (không lấy notes của user khác)
- `POST /api/notes` — tạo note mới (title, content, tags là array string tùy chọn)
- `GET /api/notes/:id` — lấy note theo id (chỉ xem được note của mình)
- `PUT /api/notes/:id` — cập nhật note (chỉ sửa được note của mình)
- `DELETE /api/notes/:id` — xóa note (chỉ xóa được note của mình)

**Admin endpoint (cần role = "admin"):**
- `GET /api/admin/notes` — lấy tất cả notes của tất cả users

### Yêu cầu kỹ thuật

1. Validate tất cả input với Joi
2. Hash password với bcrypt
3. JWT authentication trên tất cả `/api/notes` routes
4. Mỗi note phải có `userId` — user chỉ thao tác được note của mình (trả `403` nếu cố xem/sửa/xóa note người khác)
5. Cấu trúc theo controller / service / routes
6. Error handling tập trung tại middleware
7. Dữ liệu lưu in-memory (chưa cần database)

### Cấu trúc data mẫu

```javascript
// Note object
{
  id: 1,
  userId: 2,          // belongs to user id 2
  title: "Meeting notes",
  content: "...",
  tags: ["work", "meeting"],
  createdAt: new Date(),
  updatedAt: new Date(),
}

// User object (trong store)
{
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  password: "$2b$10$...",  // bcrypt hash
  role: "user",            // "user" hoặc "admin"
  createdAt: new Date(),
}
```

### Tiêu chí bonus

- Thêm query filter cho `GET /api/notes?tag=work` — lọc notes theo tag
- Thêm `GET /api/notes/search?q=keyword` — tìm kiếm trong title và content
- Seed sẵn 1 admin user khi server khởi động (để test không cần tạo tay)

---

## Tiêu chí đánh giá

| Tiêu chí | Mô tả | Điểm |
|---|---|---|
| Bài 1 - Validation | Schema đúng, error message rõ ràng, middleware tái sử dụng được | 20 |
| Bài 2 - Auth | Register/Login hoạt động, JWT đúng, protected routes đúng | 30 |
| Bài 3 - Project Structure | Tách đúng layer, controller không có business logic | 15 |
| Homework - Notes API | Đủ chức năng, auth đúng, ownership check, code sạch | 35 |

**Pass Day 3:** >= 70 điểm

**Fail ngay nếu:**
- Lưu plaintext password (không dùng bcrypt)
- Không có validation trên bất kỳ route nào
- Route bảo vệ không kiểm tra token

---

## Tài liệu tham khảo

**Bắt buộc đọc:**
- [Joi - Getting started](https://joi.dev/api/)
- [jsonwebtoken - npm](https://www.npmjs.com/package/jsonwebtoken)
- [bcrypt - npm](https://www.npmjs.com/package/bcrypt)
- [JWT.io - Introduction](https://jwt.io/introduction)

**Đọc thêm:**
- [OWASP - Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP - Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT.io Debugger](https://jwt.io/) — paste token vào để xem payload

**Tool:**
- [JWT.io Debugger](https://jwt.io/) — decode và inspect JWT
- Postman / Thunder Client — test auth flow (set Authorization header)

---

*Stuck quá 15 phút với một bài -> hỏi mentor ngay.*
