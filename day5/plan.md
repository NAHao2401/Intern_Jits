# Day 5 - Advanced Mongoose & Mini-Project Tổng Hợp

**Mục tiêu:** Nắm vững Mongoose nâng cao (hooks, methods, virtuals, aggregation), xử lý lỗi đúng chuẩn, và xây dựng E-commerce API tổng hợp toàn bộ kiến thức Day 1-5.

Sau Day 5, thực tập sinh có thể:
- Viết `pre("save")` hook để auto-hash password, filter dữ liệu
- Thêm instance method và static method vào Mongoose schema
- Dùng virtual field để tính toán giá trị không lưu DB
- Viết aggregation pipeline với `$match`, `$group`, `$lookup`, `$unwind`
- Phân biệt khi nào dùng aggregation vs populate + JS
- Xử lý `ValidationError`, `CastError`, `MongoServerError` (11000) trong error middleware
- Xây dựng E-commerce API hoàn chỉnh với Auth + Product + Order

---

## Câu hỏi tìm hiểu trước

Trước khi học, tìm hiểu và trả lời các câu hỏi sau.

**Mongoose Middleware**
- Mongoose middleware (hooks) là gì? Khác Express middleware ở điểm nào?
- `pre` và `post` hook khác nhau thế nào? Khi nào dùng cái nào?
- `pre("save")` có chạy khi gọi `findByIdAndUpdate()` không? Tại sao?
- Nếu `pre("save")` throw error thì điều gì xảy ra?

**Methods & Statics**
- Instance method và static method khác nhau ở điểm nào?
- Tại sao `userSchema.methods.comparePassword` lại cần `function()` thay vì arrow function?
- `this` trong instance method trỏ đến gì?

**Virtuals**
- Virtual field là gì? Nó được lưu vào MongoDB không?
- Khi nào dùng virtual thay vì computed field trong code?
- `toJSON: { virtuals: true }` có tác dụng gì?

**Aggregation**
- Aggregation Pipeline là gì? Tại sao gọi là "pipeline"?
- `$group` yêu cầu gì bắt buộc trong mỗi stage?
- `$lookup` tương đương với lệnh SQL nào?
- Khi nào dùng aggregation thay vì populate + xử lý JS?

**Error Types**
- MongoDB error code `11000` báo hiệu lỗi gì?
- `CastError` xảy ra trong trường hợp nào?
- Tại sao không nên trả nguyên Mongoose error message ra client?

---

## Phần 0 - Chuẩn bị

Cài dependencies:

```bash
npm install mongoose express joi bcrypt jsonwebtoken dotenv slugify
npm install --save-dev nodemon
```

Khởi động MongoDB local hoặc dùng MongoDB Atlas:

```bash
# Local (cần cài MongoDB trước)
mongod --dbpath ~/data/db

# Hoặc dùng Docker
docker run -d -p 27017:27017 --name mongo mongo:7
```

File `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/day5_training
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

Kiểm tra kết nối:

```javascript
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Connection failed:", err));
```

---

## Phần 1 - Mongoose Middleware (Hooks)

### Hooks là gì?

Mongoose hooks cho phép chạy logic **trước (pre)** hoặc **sau (post)** các operation nhất định.

```
Document hooks: validate, save, remove, deleteOne, init
Query hooks:    find, findOne, findOneAndUpdate, count, ...
Aggregate hooks: aggregate
```

### pre("save") — Hash password tự động

Vấn đề: Nếu hash password trong route handler, mỗi nơi update password đều phải nhớ hash. Dễ quên → security hole.

Giải pháp: Hook `pre("save")` — Mongoose tự động hash trước khi lưu.

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// pre("save") chạy TRƯỚC khi document được lưu vào MongoDB
userSchema.pre("save", async function (next) {
  // "this" = document đang được lưu
  // isModified() kiểm tra field có thay đổi không
  if (!this.isModified("password")) {
    return next(); // password không thay đổi -> bỏ qua
  }

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

const User = mongoose.model("User", userSchema);
```

**Lưu ý quan trọng:** `pre("save")` KHÔNG chạy khi dùng:
- `User.findByIdAndUpdate()`
- `User.updateOne()`
- `User.updateMany()`

Khi cần update password, phải fetch document rồi gọi `.save()`:

```javascript
// ĐÚNG: hook chạy
const user = await User.findById(id);
user.password = newPassword;
await user.save(); // pre("save") hook chạy ở đây

// SAI: hook KHÔNG chạy, password không được hash
await User.findByIdAndUpdate(id, { password: newPassword });
```

### pre("find") — Filter dữ liệu tự động

```javascript
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  isDeleted: { type: Boolean, default: false },
});

// Mọi query find/findOne tự động exclude soft-deleted docs
productSchema.pre(/^find/, function (next) {
  // "this" = query object
  this.where({ isDeleted: { $ne: true } });
  next();
});
```

### post hook — Logging

```javascript
userSchema.post("save", function (doc) {
  console.log(`User saved: ${doc._id} (${doc.email})`);
});

userSchema.post("save", function (error, doc, next) {
  // post hook có 3 tham số = error handler
  if (error.code === 11000) {
    next(new Error("Email already exists"));
  } else {
    next(error);
  }
});
```

---

## Phần 2 - Instance Methods & Static Methods

### Instance Methods

Gắn method vào từng document (instance). Dùng `function()` — không dùng arrow function vì cần `this`.

```javascript
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  loginCount: { type: Number, default: 0 },
});

// Instance method — gọi trên document: user.comparePassword(...)
userSchema.methods.comparePassword = async function (plaintext) {
  // "this" = user document
  return bcrypt.compare(plaintext, this.password);
};

userSchema.methods.incrementLoginCount = async function () {
  this.loginCount += 1;
  return this.save();
};

// Sử dụng
const user = await User.findOne({ email });
const isMatch = await user.comparePassword("mypassword123");
```

### Static Methods

Gắn method vào Model (class). Dùng cho query operations.

```javascript
// Static method — gọi trên Model: User.findByEmail(...)
userSchema.statics.findByEmail = function (email) {
  // "this" = Model (User)
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveAdmins = function () {
  return this.find({ role: "admin", isActive: true });
};

// Sử dụng
const user = await User.findByEmail("alice@example.com");
const admins = await User.findActiveAdmins();
```

### Khi nào dùng cái nào?

| | Instance Method | Static Method |
|---|---|---|
| Gọi trên | Document (instance) | Model (class) |
| Truy cập `this` | Document data | Model |
| Dùng khi | Cần data của document đó | Query, tìm documents |
| Ví dụ | `user.comparePassword()`, `user.toSafeObject()` | `User.findByEmail()`, `User.findActiveUsers()` |

---

## Phần 3 - Virtuals

Virtual là field **tính toán** — không lưu vào MongoDB, được tính khi cần.

```javascript
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: String,
  },
  {
    toJSON: { virtuals: true },   // virtuals xuất hiện khi JSON.stringify()
    toObject: { virtuals: true }, // virtuals xuất hiện khi .toObject()
  }
);

// Định nghĩa virtual
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual với getter + setter
userSchema.virtual("fullName")
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function (name) {
    const parts = name.split(" ");
    this.firstName = parts[0];
    this.lastName = parts.slice(1).join(" ");
  });

// Virtual populate — quan hệ ngược (không cần lưu ref)
userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "author",
});

// Sử dụng
const user = await User.findById(id).populate("posts");
console.log(user.fullName); // "Alice Smith"
console.log(user.posts);    // array of Post documents
```

**Lưu ý:** Virtual KHÔNG được query theo. `User.find({ fullName: "Alice" })` sẽ không hoạt động.

---

## Phần 4 - Schema Validation Nâng Cao

```javascript
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [100, "Name cannot exceed 100 characters"],
  },

  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },

  category: {
    type: String,
    enum: {
      values: ["electronics", "clothing", "food", "books"],
      message: "{VALUE} is not a valid category",
    },
    required: true,
  },

  email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },

  discount: {
    type: Number,
    // Custom validator
    validate: {
      validator: function (value) {
        return value >= 0 && value <= 100;
      },
      message: (props) => `${props.value} is not a valid discount (0-100)`,
    },
  },

  tags: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.length <= 10;
      },
      message: "Maximum 10 tags allowed",
    },
  },
});
```

### Indexes

```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true, // shorthand cho index({ email: 1 }, { unique: true })
  },
  username: String,
  createdAt: Date,
});

// Compound index
userSchema.index({ username: 1 }); // single field
userSchema.index({ createdAt: -1, role: 1 }); // compound

// Text search index
userSchema.index({ name: "text", description: "text" });
// Dùng: Model.find({ $text: { $search: "keyword" } })

// TTL index — tự xóa document sau N giây
const sessionSchema = new mongoose.Schema({
  token: String,
  createdAt: { type: Date, default: Date.now },
});
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 }); // xóa sau 1 giờ
```

**Tại sao index quan trọng?**

```
Collection 1,000,000 users, query: User.findOne({ email: "alice@example.com" })

Không có index: MongoDB đọc 1,000,000 documents (full collection scan) -> chậm
Có index:       MongoDB tra cứu B-tree -> O(log n) -> cực nhanh

Rule: Field nào hay dùng trong .find(), .findOne() -> cân nhắc index
      Không index tất cả -> index tốn disk + làm chậm write
```

---

## Phần 5 - Aggregation Pipeline

### Tại sao cần aggregation?

```javascript
// Bài toán: Đếm số posts theo category

// Cách 1: Query + JS (BAD với big data)
const posts = await Post.find(); // load HẾT lên memory
const counts = {};
posts.forEach((p) => {
  counts[p.category] = (counts[p.category] || 0) + 1;
});
// Vấn đề: 1M posts -> load 1M docs vào RAM

// Cách 2: Aggregation (GOOD)
const result = await Post.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } },
]);
// MongoDB xử lý trên server, chỉ trả về kết quả nhỏ
```

### Các stage phổ biến

```javascript
// $match — lọc documents (đặt đầu pipeline để dùng index)
{ $match: { isPublished: true, createdAt: { $gte: new Date("2024-01-01") } } }

// $group — nhóm và tính toán
{
  $group: {
    _id: "$category",           // group by field
    count: { $sum: 1 },         // đếm
    avgPrice: { $avg: "$price" },
    totalRevenue: { $sum: "$price" },
    maxPrice: { $max: "$price" },
    minPrice: { $min: "$price" },
    tags: { $addToSet: "$tag" }, // collect unique values
  }
}

// $project — chọn/rename/transform fields
{
  $project: {
    name: 1,           // include
    email: 1,
    password: 0,       // exclude
    fullName: { $concat: ["$firstName", " ", "$lastName"] },
    priceUSD: { $divide: ["$priceVND", 23000] },
  }
}

// $sort — sắp xếp
{ $sort: { count: -1, name: 1 } } // count desc, name asc

// $limit và $skip — pagination
{ $limit: 10 }
{ $skip: 20 }

// $lookup — LEFT JOIN với collection khác
{
  $lookup: {
    from: "users",        // collection để join
    localField: "author", // field trong collection hiện tại
    foreignField: "_id",  // field trong collection kia
    as: "authorInfo",     // tên field chứa kết quả
  }
}

// $unwind — tách array thành nhiều documents
// [{ tags: ["a","b"] }] -> [{ tags: "a" }, { tags: "b" }]
{ $unwind: "$tags" }
// Giữ documents không có field hoặc array rỗng:
{ $unwind: { path: "$tags", preserveNullAndEmptyArrays: true } }

// $addFields — thêm field mới
{
  $addFields: {
    totalLikes: { $size: "$likes" },
    isPopular: { $gt: [{ $size: "$likes" }, 100] },
  }
}
```

### Pipeline thực tế — Top authors theo số posts

```javascript
const topAuthors = await Post.aggregate([
  // Bước 1: Chỉ lấy published posts
  { $match: { isPublished: true } },

  // Bước 2: Group theo author, đếm posts và tổng views
  {
    $group: {
      _id: "$author",
      postCount: { $sum: 1 },
      totalViews: { $sum: "$viewCount" },
      avgViews: { $avg: "$viewCount" },
    },
  },

  // Bước 3: Join với users collection để lấy thông tin author
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "authorInfo",
    },
  },

  // Bước 4: $lookup trả array, lấy phần tử đầu tiên
  { $unwind: "$authorInfo" },

  // Bước 5: Chọn fields cần thiết
  {
    $project: {
      _id: 0,
      authorName: { $concat: ["$authorInfo.firstName", " ", "$authorInfo.lastName"] },
      email: "$authorInfo.email",
      postCount: 1,
      totalViews: 1,
      avgViews: { $round: ["$avgViews", 0] },
    },
  },

  // Bước 6: Sort by postCount desc
  { $sort: { postCount: -1 } },

  // Bước 7: Top 5
  { $limit: 5 },
]);
```

### Aggregate vs Populate — khi nào dùng cái nào?

| Tình huống | Dùng | Lý do |
|---|---|---|
| Đọc document + cần data của ref | `populate()` | Đơn giản hơn, code rõ ràng |
| Tính toán thống kê (count, sum, avg) | `aggregate()` | Server xử lý, hiệu quả hơn |
| Lọc theo field của document đã join | `aggregate()` | populate không filter được |
| Complex transformation | `aggregate()` | Linh hoạt hơn |
| Simple CRUD với relations | `populate()` | Ít code hơn |

---

## Phần 6 - Error Handling Production Patterns

### Các loại Mongoose Error

```javascript
// 1. ValidationError — schema validation fail
const user = new User({ email: "not-an-email" });
await user.save();
// MongooseError: User validation failed: email: "not-an-email" is not valid

// 2. CastError — sai kiểu dữ liệu (ví dụ: ObjectId không hợp lệ)
await User.findById("not-a-valid-id");
// CastError: Cast to ObjectId failed for value "not-a-valid-id"

// 3. MongoServerError (code 11000) — duplicate key
await User.create({ email: "existing@email.com" });
// MongoServerError: E11000 duplicate key error collection: ... email: "existing@email.com"
```

### Global Error Middleware

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err); // Log chi tiết cho developer

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = null;

  // Mongoose ValidationError -> 400
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose CastError (invalid ObjectId) -> 400
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ID format: "${err.value}"`;
  }

  // MongoDB duplicate key -> 409
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // JWT errors (đã học Day 3)
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  // Response — không expose stack trace
  const response = {
    success: false,
    error: message,
  };

  if (details) response.details = details;

  // Chỉ trả stack trong development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
```

### Connection Retry Logic

```javascript
// db/connect.js
const mongoose = require("mongoose");

const RETRY_INTERVAL = 5000; // 5 giây
const MAX_RETRIES = 5;

async function connectDB(retries = 0) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    if (retries < MAX_RETRIES) {
      console.log(`Connection failed. Retry ${retries + 1}/${MAX_RETRIES} in ${RETRY_INTERVAL / 1000}s...`);
      setTimeout(() => connectDB(retries + 1), RETRY_INTERVAL);
    } else {
      console.error("Could not connect to MongoDB after max retries");
      process.exit(1);
    }
  }
}

// Lắng nghe sự kiện connection
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
});

module.exports = connectDB;
```

---

## Bài tập trong giờ

### Bài tập 1 — Advanced Schema
Xem `exercises/01-advanced-schema/index.js`

### Bài tập 2 — Aggregation Pipeline
Xem `exercises/02-aggregation/index.js`

### Bài tập 3 — Error Handling
Xem `exercises/03-error-handling/index.js`

---

## Homework — E-commerce API

Xem `homework/ecommerce-api/`

Xây dựng API tổng hợp Day 1-5 với các tính năng:
- Authentication (JWT + bcrypt) — reuse từ Day 3
- Product CRUD với rating system
- Category management
- Order creation với stock validation
- Aggregation cho product statistics
- Full error handling (tất cả Mongoose error types)

Chi tiết yêu cầu trong `homework/ecommerce-api/src/` — mỗi file có TODO stubs.

---

## Tiêu chí đánh giá (Pass >= 70/100)

| Hạng mục | Điểm | Tiêu chí |
|---|---|---|
| Exercise 01 | 20 | pre-save hook hash đúng, comparePassword hoạt động, static/virtual đúng |
| Exercise 02 | 20 | Tất cả 6 aggregation stage chạy ra kết quả đúng |
| Exercise 03 | 20 | Error middleware nhận diện đúng 3 loại error, status code đúng |
| Homework Models | 15 | 4 models đúng schema, hooks hoạt động |
| Homework Services | 15 | Services dùng đúng Mongoose API, throw error với statusCode |
| Code quality | 10 | async/await nhất quán, không callback hell, error không expose internals |

**Hard fail (0 điểm homework):**
- Password không hash (plaintext trong DB)
- Mongoose error expose nguyên vẹn ra client (stack trace / error.errors object)
- findByIdAndUpdate dùng để update password (bypass hook)

---

## Tài liệu tham khảo

- [Mongoose Middleware](https://mongoosejs.com/docs/middleware.html)
- [Mongoose Schema Types](https://mongoosejs.com/docs/schematypes.html)
- [Mongoose Virtuals](https://mongoosejs.com/docs/guide.html#virtuals)
- [MongoDB Aggregation Pipeline](https://www.mongodb.com/docs/manual/core/aggregation-pipeline/)
- [MongoDB Aggregation Operators](https://www.mongodb.com/docs/manual/reference/operator/aggregation/)
- [Mongoose Error Handling](https://mongoosejs.com/docs/error-handling.html)
- [MongoDB Indexes](https://www.mongodb.com/docs/manual/indexes/)
