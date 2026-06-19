/**
 * Day 4 - Bài 3: Populate (References giữa Documents)
 *
 * Mục tiêu:
 * - Hiểu reference pattern (ObjectId ref) vs embedding
 * - Dùng .populate() để load referenced documents
 * - Chọn fields khi populate
 * - Query by reference (tìm posts của một user cụ thể)
 * - Dùng virtual fields
 *
 * Cấu trúc file:
 *   03-populate/
 *   ├── models/
 *   │   ├── user.model.js  (User schema + virtual displayName)
 *   │   ├── post.model.js  (Post schema, author ref User, virtual snippet)
 *   │   └── index.js       (connect + export)
 *   └── index.js           (bài tập này)
 *
 * Chạy:
 *   node index.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { connectDB, disconnectDB, User, Post } = require("./models");

// ============================================================
// SEED DATA
// ============================================================

async function seedData() {
  // Xóa data cũ
  await Post.deleteMany({});
  await User.deleteMany({});

  // Tạo users
  const alice = await User.create({
    name: "Alice Nguyen",
    email: "alice@example.com",
    password: "Password123",
    role: "admin",
    bio: "Full-stack developer, coffee lover",
  });

  const bob = await User.create({
    name: "Bob Tran",
    email: "bob@example.com",
    password: "Password456",
    role: "user",
    bio: "Backend engineer",
  });

  const carol = await User.create({
    name: "Carol Le",
    email: "carol@example.com",
    password: "Password789",
    role: "user",
  });

  // Tạo posts với author reference
  await Post.create([
    {
      title: "Getting Started with Node.js",
      content:
        "Node.js is a JavaScript runtime built on Chrome's V8 engine. It allows you to run JavaScript on the server side...",
      author: alice._id,
      tags: ["nodejs", "javascript", "backend"],
      published: true,
    },
    {
      title: "Understanding Async/Await in JavaScript",
      content:
        "Async/await is syntactic sugar on top of Promises. It makes asynchronous code look and behave more like synchronous code...",
      author: alice._id,
      tags: ["javascript", "async", "promises"],
      published: true,
    },
    {
      title: "MongoDB vs PostgreSQL: When to Choose Which",
      content:
        "Both MongoDB and PostgreSQL are excellent databases. The choice depends on your data structure, query patterns, and team expertise...",
      author: bob._id,
      tags: ["database", "mongodb", "postgresql"],
      published: true,
    },
    {
      title: "Draft: REST API Best Practices",
      content:
        "This is a draft post about REST API design. Will cover versioning, error handling, pagination...",
      author: bob._id,
      tags: ["api", "rest", "backend"],
      published: false,
    },
    {
      title: "Introduction to Express Middleware",
      content:
        "Middleware functions in Express are functions that have access to the request object (req), the response object (res), and the next function...",
      author: carol._id,
      tags: ["expressjs", "middleware", "nodejs"],
      published: true,
    },
  ]);

  console.log("Seeded: 3 users, 5 posts");
  return { alice, bob, carol };
}

// ============================================================
// TODO 3.1 - Tạo user và post với reference
// ============================================================
// Yêu cầu:
// 1. Tạo 1 user mới (Dave) và 1 post mới do Dave viết
// 2. Khi tạo post, set author = dave._id
// 3. Log post.author trước khi populate -> là ObjectId
// 4. Log post.author sau khi populate -> là User object đầy đủ
//
// Gợi ý:
//   const dave = await User.create({ name: "Dave", email: "dave@...", password: "..." });
//   const post = await Post.create({ title: "...", content: "...", author: dave._id, ... });
//   console.log("Before populate:", post.author); // ObjectId
//   await post.populate("author");
//   console.log("After populate:", post.author.name); // "Dave"
//
// Câu hỏi tư duy:
//   - post.author lưu gì trong database? (gợi ý: kiểm tra trong MongoDB Compass)
//   - Sau khi populate(), post.author trở thành gì?

async function createPostWithReference() {
  console.log("\n--- TODO 3.1: Create post with reference ---");
  // TODO 3.1: Tạo user Dave và post với reference đến Dave
  const dave = await User.create({
    name: "Dave",
    email: "dave@example.com",
    password: "Password123",
    role: "user",
    bio: "Node.js Developer",
  });

  const post = await Post.create({
    title: "Learning Mongoose Populate",
    content:
      "Populate giúp lấy dữ liệu từ document được reference bằng ObjectId...",
    author: dave._id,
    tags: ["mongoose", "mongodb"],
    published: true,
  });

  console.log("Before populate:", post.author);

  await post.populate("author");

  console.log("After populate:", post.author);
}

// ============================================================
// TODO 3.2 - populate("author") cơ bản
// ============================================================
// Yêu cầu:
// 1. Lấy tất cả posts với .populate("author")
// 2. Log từng post theo format:
//    "[published/draft] <title> by <author.name>"
// 3. Verify: author là object đầy đủ (log author.email)
//
// Gợi ý:
//   const posts = await Post.find().populate("author").lean();
//   posts.forEach(p => {
//     const status = p.published ? "published" : "draft";
//     console.log(`[${status}] ${p.title} by ${p.author.name}`);
//   });

async function getAllPostsWithAuthor() {
  console.log("\n--- TODO 3.2: Get all posts with author populated ---");
  // TODO 3.2: Find all posts, populate author
  const posts = await Post.find().populate("author").lean();
  posts.forEach((post) => {
    const status = post.published ? "published" : "draft";

    console.log(`[${status}] ${post.title} by ${post.author.name}`);

    console.log("Email:", post.author.email);
  });

  return posts;
}

// ============================================================
// TODO 3.3 - populate với field selection
// ============================================================
// Yêu cầu:
// 1. Lấy tất cả posts nhưng populate author chỉ lấy name và email
// 2. Log kết quả để verify: author.password không có, author.role không có
// 3. Cũng chỉ select title, published, author từ Post (bỏ content, tags, viewCount)
//
// Gợi ý:
//   const posts = await Post.find()
//     .select("title published author")
//     .populate({
//       path: "author",
//       select: "name email -_id",
//     })
//     .lean();

async function getPostsSelectivePopulate() {
  console.log("\n--- TODO 3.3: Populate with field selection ---");
  // TODO 3.3: Populate author with only name and email fields
  const posts = await Post.find()
    .select("title published author")
    .populate({
      path: "author",
      select: "name email -_id",
    })
    .lean();

  console.log(posts);

  return posts;
}

// ============================================================
// TODO 3.4 - Find posts của một user cụ thể
// ============================================================
// Yêu cầu:
// 1. Nhận vào userId (Alice's _id)
// 2. Tìm tất cả published posts của user đó
// 3. Sort theo createdAt mới nhất trước
// 4. Populate author (chỉ lấy name)
// 5. Log: "Alice has X published posts:"
//         "  - <title> (tags: <tags.join(", ")>)"
//
// Gợi ý:
//   const posts = await Post.find({ author: userId, published: true })
//     .sort({ createdAt: -1 })
//     .populate("author", "name")
//     .lean();

async function getPostsByUser(userId) {
  console.log(`\n--- TODO 3.4: Get posts by user ${userId} ---`);
  // TODO 3.4: Find published posts by specific user
  const posts = await Post.find({ author: userId, published: true })
    .sort({ createdAt: -1 })
    .populate("author", "name")
    .lean();

  console.log(`${posts[0]?.author.name} has ${posts.length} published posts:`);

  posts.forEach((post) => {
    console.log(`- ${post.title} (tags: ${post.tags.join(", ")})`);
  });

  return posts;
}

// ============================================================
// TODO 3.5 - Find published posts, populate, sort
// ============================================================
// Yêu cầu:
// 1. Lấy tất cả published posts
// 2. Sort theo createdAt mới nhất trước
// 3. Chỉ lấy: title, tags, author (name + email), createdAt
// 4. Populate author đầy đủ info (name, email, bio)
// 5. Log count và list
//
// Bonus: Group logs theo author name
//
// Gợi ý:
//   const posts = await Post.find({ published: true })
//     .sort({ createdAt: -1 })
//     .select("title tags author createdAt")
//     .populate({ path: "author", select: "name email bio" })
//     .lean();

async function getPublishedPosts() {
  console.log("\n--- TODO 3.5: Get published posts with author info ---");
  // TODO 3.5: Find all published posts, populate author, sort by createdAt desc
  const posts = await Post.find({ published: true })
    .sort({ createdAt: -1 })
    .select("title tags author createdAt")
    .populate({ path: "author", select: "name email bio" })
    .lean();

  console.log(`Total published posts: ${posts.length}`);

  let currentAuthor = "";
  posts.forEach((post) => {
    if (currentAuthor !== post.author.name) {
      currentAuthor = post.author.name;
      console.log(`\n${currentAuthor}:`);
    }
    console.log(`- ${post.title}`);
  });

  return posts;
}

// ============================================================
// TODO 3.6 - Virtual fields
// ============================================================
// Yêu cầu:
// 1. Lấy 1 post và populate author
// 2. Access virtual field: post.snippet (100 ký tự đầu của content)
// 3. Access virtual field: post.author.displayName
// 4. Log cả hai để verify
//
// QUAN TRỌNG: .lean() bỏ virtuals! Không dùng .lean() ở bài này.
//
// Gợi ý:
//   const post = await Post.findOne({ published: true }).populate("author");
//   // Không dùng .lean() vì cần virtuals
//   console.log("Snippet:", post.snippet);         // từ virtual
//   console.log("Display:", post.author.displayName); // từ virtual trên User
//
// Câu hỏi tư duy: (trả lời trong comment dưới)
//   Q1: populate() trong Mongoose tương đương với gì trong SQL?
//       Có phải là 1 query hay nhiều query?
//   Q2: Khi nào nên embed document, khi nào nên dùng reference?
//       Cho ví dụ: Comment (embed hay ref?) - Comments (embed hay ref?)
//   Q3: Nhược điểm của populate() về performance?
//       Cách khắc phục trong production?

async function demonstrateVirtuals() {
  console.log("\n--- TODO 3.6: Virtual fields ---");
  // TODO 3.6: Access virtual fields (snippet, displayName)
  // Trả lời câu hỏi tư duy trong comment bên dưới
  //
  // Q1: populate() tương đương JOIN trong SQL. Thông thường sẽ lấy nhiều query
  // Q2: Embed:
  //        - Dữ liệu nhỏ, ít thay đổi, luôn đi cùng document cha. Ví dụ: Address của User
  //     Reference:
  //        - Dữ liệu lớn, có thể dùng chung. Ví dụ: User -> Posts
  // Q3: Nhược điểm:
  //            - Phải thực hiện thêm query, populate nhiều tầng sẽ chậm
  //     Khắc phục: Chỉ populate khi cần, chỉ select các field cần thiết.
  const post = await Post.findOne({
    published: true,
  }).populate("author");

  console.log("Snippet:");
  console.log(post.snippet);

  console.log();

  console.log("Author Display Name:");
  console.log(post.author.displayName);
}

// ============================================================
// MAIN
// ============================================================

async function run() {
  console.log("=".repeat(50));
  console.log("Day 4 - Exercise 03: Populate");
  console.log("=".repeat(50));

  await connectDB();

  // Seed data
  const { alice, bob } = await seedData();

  // Run todos
  await createPostWithReference();
  await getAllPostsWithAuthor();
  await getPostsSelectivePopulate();
  await getPostsByUser(alice._id);
  await getPublishedPosts();
  await demonstrateVirtuals();

  console.log("\nAll done.");
  await disconnectDB();
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
