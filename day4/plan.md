# Day 4 - MongoDB & Mongoose

**Mục tiêu:** Thay thế in-memory data store bằng MongoDB thực, sử dụng Mongoose ODM để định nghĩa schema, thực hiện CRUD và query nâng cao.

Sau Day 4, thực tập sinh có thể:
- Giải thích sự khác biệt giữa database quan hệ (SQL) và document database (MongoDB)
- Kết nối Mongoose tới MongoDB và xử lý các connection events
- Định nghĩa Schema với đầy đủ types, validations, và options
- Thực hiện CRUD đầy đủ với Mongoose methods
- Viết queries nâng cao: filter, sort, pagination, field selection
- Dùng `populate()` để load referenced documents (tương tự JOIN trong SQL)
- Tích hợp Mongoose vào Express app đã xây dựng từ Day 2-3

---

## Câu hỏi tìm hiểu trước

Trước khi học, tìm hiểu và trả lời các câu hỏi sau. Không cần đúng hoàn toàn — mục tiêu là có hình dung ban đầu.

**MongoDB cơ bản**
- Database quan hệ (SQL) và document database (NoSQL) khác nhau thế nào?
- Document trong MongoDB là gì? Nó trông như thế nào?
- Collection và Table khác nhau điểm nào?
- MongoDB "schema-less" nghĩa là gì? Ưu và nhược điểm?
- Khi nào chọn MongoDB, khi nào chọn PostgreSQL/MySQL?

**Mongoose**
- Mongoose là gì? Tại sao cần Mongoose khi đã có MongoDB driver?
- ODM (Object Document Mapper) là gì? Khác ORM (Object Relational Mapper) thế nào?
- Schema trong Mongoose làm gì nếu MongoDB vốn schema-less?
- `ObjectId` là gì? Tại sao MongoDB không dùng integer auto-increment làm id?

**CRUD với Mongoose**
- `Model.find()` và `Model.findOne()` khác nhau thế nào?
- `findByIdAndUpdate()` với option `{ new: true }` làm gì?
- `runValidators: true` khi update quan trọng thế nào?
- `.lean()` khác gì với query bình thường? Khi nào nên dùng?

**References & Populate**
- Embed (lưu document con vào document cha) và reference (lưu id tham chiếu) khác nhau thế nào?
- Khi nào nên embed, khi nào nên reference?
- `populate()` trong Mongoose tương đương với gì trong SQL?
- `populate()` có cost gì về performance không?

---

## Phần 0 - Chuẩn bị

### Cài MongoDB (nếu chưa có)

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Kiểm tra MongoDB đang chạy:**
```bash
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
# Hoặc đơn giản hơn:
mongosh
# Nếu vào được shell -> MongoDB đang chạy
```

**Windows:** Tải installer tại [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

### Cài dependencies

```bash
npm install mongoose dotenv express joi bcrypt jsonwebtoken
npm install --save-dev nodemon
```

### Cấu hình .env

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/internship_day4
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

**Kiểm tra kết nối:**
```javascript
// test-connection.js
require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
```

```bash
node test-connection.js
# Output: Connected to MongoDB
```

---

## Phần 1 - MongoDB và Mongoose Basics

### SQL vs MongoDB — đối chiếu khái niệm

| SQL (MySQL/PostgreSQL) | MongoDB |
|---|---|
| Database | Database |
| Table | Collection |
| Row / Record | Document |
| Column | Field |
| Primary key (INT auto-increment) | `_id` (ObjectId, 12 bytes) |
| Foreign key | Reference (ObjectId của collection khác) |
| JOIN | `populate()` |
| Schema cố định | Schema linh hoạt (schema-less) |
| `SELECT * FROM users WHERE id = 1` | `User.findById("64a1b2c3...")` |

### ObjectId là gì?

```
ObjectId: 64a1b2c3d4e5f6a7b8c9d0e1
          |----||------||---------|
          4 bytes  5 bytes  3 bytes
          timestamp machine  counter
                   + process
```

Không phải số nguyên tự tăng — ObjectId chứa timestamp, có thể suy ra thời gian tạo:
```javascript
const id = new mongoose.Types.ObjectId();
console.log(id.getTimestamp()); // Date object
```

### Kết nối Mongoose

```javascript
require("dotenv").config();
const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // thoát nếu không kết nối được -> server không nên chạy
  }
}

// Connection events
mongoose.connection.on("connected", () => console.log("Mongoose connected"));
mongoose.connection.on("error", (err) => console.error("Mongoose error:", err));
mongoose.connection.on("disconnected", () => console.log("Mongoose disconnected"));

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed (app termination)");
  process.exit(0);
});

module.exports = connectDB;
```

### Định nghĩa Schema và Model

```javascript
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],  // [type, error message]
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,            // tạo unique index tự động
      lowercase: true,         // tự convert sang lowercase trước khi save
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,           // QUAN TRỌNG: không trả về password trong queries mặc định
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin", "moderator"],
        message: "{VALUE} is not a valid role",  // {VALUE} là giá trị bị reject
      },
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [150, "Age seems unrealistic"],
    },
    tags: [String],            // array of strings
    address: {                 // nested object (embedded)
      street: String,
      city: String,
      country: { type: String, default: "Vietnam" },
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,          // tự động thêm createdAt và updatedAt
    versionKey: false,         // bỏ __v field (version key)
  }
);

// Tạo Model từ Schema
const User = mongoose.model("User", userSchema);
// Collection name: "users" (Mongoose tự lowercase + pluralize)
// model("User") -> collection "users"
// model("BlogPost") -> collection "blogposts"

module.exports = User;
```

### SchemaTypes quan trọng

```javascript
const schema = new Schema({
  // Primitives
  name:      String,
  price:     Number,
  inStock:   Boolean,
  createdAt: Date,

  // ObjectId reference (dùng cho populate)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",          // tên Model sẽ populate
    required: true,
  },

  // Arrays
  tags:    [String],                     // array of strings
  scores:  [Number],                     // array of numbers
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],  // array of references

  // Mixed (bất kỳ type nào)
  metadata: Schema.Types.Mixed,          // tránh dùng nếu có thể

  // Buffer (binary data)
  avatar: Buffer,
});
```

### CRUD cơ bản

```javascript
// CREATE
// Cách 1: Model.create()
const user = await User.create({
  name: "Alice",
  email: "alice@example.com",
  password: hashedPassword,
});

// Cách 2: new Model().save()
const user = new User({ name: "Bob", email: "bob@example.com", password: hash });
await user.save();
// Khác biệt: .save() cho phép set thêm data trước khi save, chạy middleware đầy đủ hơn

// READ
const users = await User.find();                          // tất cả
const user  = await User.findById("64a1b2c3d4e5f6...");  // theo id
const user  = await User.findOne({ email: "alice@example.com" }); // điều kiện

// UPDATE
const updated = await User.findByIdAndUpdate(
  id,
  { name: "Alice Updated" },
  {
    new: true,           // trả về document SAU khi update (mặc định là trước)
    runValidators: true, // chạy schema validators khi update (mặc định không chạy)
  }
);

// DELETE
const deleted = await User.findByIdAndDelete(id);
// deleted là document đã bị xóa, hoặc null nếu không tìm thấy

// Kiểm tra tồn tại (hiệu quả hơn findOne)
const exists = await User.exists({ email: "alice@example.com" });
// trả về { _id: ObjectId(...) } nếu tồn tại, null nếu không

// Đếm
const count = await User.countDocuments({ role: "user" });
```

---

## Phần 2 - CRUD với Mongoose (thực hành)

Xem file: `exercises/01-mongoose-basics/index.js`

---

## Phần 3 - Querying nâng cao

### Query Operators

```javascript
// Comparison operators
await Product.find({ price: { $gt: 100 } });           // price > 100
await Product.find({ price: { $gte: 100, $lte: 500 } }); // 100 <= price <= 500
await Product.find({ price: { $ne: 0 } });             // price != 0
await Product.find({ category: { $in: ["tech", "gaming"] } }); // category in list
await Product.find({ category: { $nin: ["clothing"] } }); // NOT in list

// Regex search (case-insensitive)
await Product.find({ name: { $regex: "phone", $options: "i" } });
// Hoặc dùng RegExp object:
await Product.find({ name: /phone/i });

// Array operators
await Product.find({ tags: "sale" });           // tags array chứa "sale"
await Product.find({ tags: { $all: ["sale", "new"] } }); // chứa cả hai
await Product.find({ tags: { $size: 3 } });     // đúng 3 elements
```

### Chaining methods

```javascript
const products = await Product
  .find({ inStock: true, price: { $gte: 50 } })
  .sort({ price: -1, name: 1 })      // sort: -1 = desc, 1 = asc
  .select("name price category -_id") // chọn fields: "-" prefix = exclude
  .limit(10)
  .skip(20)                           // skip 20 docs = page 3 (nếu limit=10)
  .lean();                            // trả về plain JS object thay vì Mongoose doc
```

### Pagination pattern chuẩn

```javascript
async function getProducts({ page = 1, limit = 10, sort = "-createdAt" }) {
  const skip = (page - 1) * limit;

  // Chạy song song: lấy data và đếm tổng
  const [data, total] = await Promise.all([
    Product.find().sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}
```

### `.lean()` — khi nào dùng

```javascript
// Không lean: trả về Mongoose Document object
// - Có methods: .save(), .toObject(), .toJSON()
// - Có virtuals, getters/setters
// - CHẬM HƠN, dùng nhiều memory hơn
const doc = await User.findById(id);
await doc.save(); // có thể gọi .save()

// Có lean: trả về plain JavaScript object
// - Không có Mongoose methods
// - NHANH HƠN (~2x), ít memory hơn
// - Dùng khi chỉ cần đọc data, không cần modify và save lại
const plainObj = await User.find().lean();
// plainObj là array of { _id, name, email, ... } — plain object
```

**Quy tắc:** Chỉ cần đọc data để trả về client -> dùng `.lean()`. Cần gọi `.save()` sau -> không dùng `.lean()`.

### Aggregate cơ bản

```javascript
// Đếm products theo category
const stats = await Product.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 }, avgPrice: { $avg: "$price" } } },
  { $sort: { count: -1 } },
]);
// [{ _id: "tech", count: 5, avgPrice: 350 }, { _id: "clothing", count: 3, avgPrice: 45 }]
```

---

## Phần 4 - Populate (References giữa Documents)

### Khi nào embed, khi nào reference?

| Embed (document con trong cha) | Reference (lưu ObjectId) |
|---|---|
| Data gắn liền với cha, không cần query riêng | Data có thể tồn tại độc lập |
| Ít hơn ~10 items trong array | Có thể nhiều items (grow unbounded) |
| Luôn cần load cùng nhau | Đôi khi không cần load |
| Ví dụ: địa chỉ của user | Ví dụ: posts của user |

### Định nghĩa Reference

```javascript
const postSchema = new Schema(
  {
    title:   { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",    // phải khớp với tên Model đã register: mongoose.model("User", ...)
      required: true,
    },
    tags:      [String],
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);
```

### Populate

```javascript
// Không populate: chỉ có ObjectId
const post = await Post.findById(id);
console.log(post.author); // ObjectId("64a1b2c3...")

// Populate: load đầy đủ User document
const post = await Post.findById(id).populate("author");
console.log(post.author); // { _id: ..., name: "Alice", email: "alice@...", ... }

// Chọn fields cần populate (tránh load password, __v, ...)
const post = await Post.findById(id).populate({
  path: "author",
  select: "name email -_id",  // lấy name, email, bỏ _id
});

// Populate nhiều fields
const post = await Post.findById(id)
  .populate("author", "name email")
  .populate("comments.author", "name");

// Nested populate (populate bên trong populate)
const posts = await Post.find().populate({
  path: "comments",
  populate: {
    path: "author",
    select: "name",
  },
});
```

### Virtual fields

```javascript
// Virtual: field được tính toán, không lưu vào database
userSchema.virtual("fullName").get(function () {
  // Không dùng arrow function! Cần "this" trỏ đến document
  return `${this.firstName} ${this.lastName}`;
});

// Cần enable virtuals khi chuyển sang JSON
const userSchema = new Schema(
  { firstName: String, lastName: String },
  {
    timestamps: true,
    toJSON: { virtuals: true },   // include virtuals trong .toJSON()
    toObject: { virtuals: true }, // include virtuals trong .toObject()
  }
);

const user = await User.findById(id);
console.log(user.fullName); // "Alice Smith"
console.log(user.toJSON()); // { ..., fullName: "Alice Smith" }
```

### models/index.js pattern

```javascript
// models/index.js — setup connection + export tất cả models
require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./user.model");
const Post = require("./post.model");

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
}

module.exports = { connectDB, User, Post };
```

---

## Bài tập

| Bài | File | Nội dung |
|---|---|---|
| Bài 1 | `exercises/01-mongoose-basics/index.js` | Connect, User schema, CRUD operations |
| Bài 2 | `exercises/02-queries/index.js` | Product schema, filter, sort, pagination, aggregate |
| Bài 3 | `exercises/03-populate/` | User + Post models, populate, virtual fields |

---

## Bài tập về nhà - Blog API với MongoDB

Nâng cấp Notes API từ Day 3 thành **Blog API** dùng MongoDB + Mongoose thực.

Xem chi tiết trong `homework/blog-api/`.

**Thay đổi lớn so với Day 3:**
- Thay in-memory store bằng Mongoose models
- 3 entities có quan hệ: User, Post, Comment
- Pagination cho list endpoints
- `populate()` khi trả về post/comment

---

## Tiêu chí đánh giá

| Tiêu chí | Mô tả | Điểm |
|---|---|---|
| Bài 1 - Mongoose Basics | Kết nối được, CRUD đầy đủ, schema validation hoạt động | 20 |
| Bài 2 - Queries | Filter/sort/pagination/aggregate đúng, `.lean()` đúng chỗ | 25 |
| Bài 3 - Populate | Populate đúng, field selection, virtual field | 20 |
| Homework - Blog API | DB thực, 3 entities, pagination, populate khi return, auth giữ nguyên | 35 |

**Pass Day 4:** >= 70 điểm

**Fail ngay nếu:**
- Không kết nối được MongoDB (connection string sai, MongoDB chưa chạy mà không debug được)
- Dùng in-memory data thay vì Mongoose trong homework
- `findByIdAndUpdate` không có `{ new: true }` → trả về data cũ cho client
- N+1 query: query trong vòng lặp thay vì dùng `populate()`

---

## Tài liệu tham khảo

**Bắt buộc đọc:**
- [Mongoose - Getting Started](https://mongoosejs.com/docs/index.html)
- [Mongoose - SchemaTypes](https://mongoosejs.com/docs/schematypes.html)
- [Mongoose - Queries](https://mongoosejs.com/docs/queries.html)
- [Mongoose - Populate](https://mongoosejs.com/docs/populate.html)
- [MongoDB - Query Operators](https://www.mongodb.com/docs/manual/reference/operator/query/)

**Đọc thêm:**
- [Mongoose - Middleware (hooks)](https://mongoosejs.com/docs/middleware.html)
- [Mongoose - Virtuals](https://mongoosejs.com/docs/guide.html#virtuals)
- [MongoDB - Aggregation Pipeline](https://www.mongodb.com/docs/manual/core/aggregation-pipeline/)
- [The Little MongoDB Book](https://github.com/karlseguin/the-little-mongodb-book)

**Tool:**
- [MongoDB Compass](https://www.mongodb.com/products/compass) — GUI để xem/sửa data trong MongoDB
- `mongosh` — MongoDB shell để chạy query trực tiếp

---

*Stuck quá 15 phút với một bài -> hỏi mentor ngay.*
