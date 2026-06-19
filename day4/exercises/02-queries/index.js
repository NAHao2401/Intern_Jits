/**
 * Day 4 - Bài 2: Querying nâng cao với Mongoose
 *
 * Mục tiêu:
 * - Dùng query operators: $gt, $gte, $lt, $lte, $in, $nin, $regex
 * - Sort, pagination với skip/limit/sort
 * - Chọn fields với select()
 * - Tối ưu với .lean()
 * - Aggregate cơ bản: đếm, tính trung bình theo nhóm
 *
 * Chạy:
 *   node index.js
 */

const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongoose = require("mongoose");

// ============================================================
// SCHEMA & MODEL
// ============================================================

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ["tech", "furniture", "clothing", "food", "sports"],
        message: "{VALUE} is not a valid category",
      },
    },
    tags: [String],
    inStock: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Product = mongoose.model("Product", productSchema);

// ============================================================
// SEED DATA
// ============================================================

const seedProducts = [
  {
    name: "iPhone 15 Pro",
    price: 999,
    category: "tech",
    tags: ["apple", "smartphone", "new"],
    inStock: true,
    rating: 4.8,
  },
  {
    name: "Samsung Galaxy S24",
    price: 799,
    category: "tech",
    tags: ["samsung", "smartphone"],
    inStock: true,
    rating: 4.6,
  },
  {
    name: "MacBook Air M3",
    price: 1299,
    category: "tech",
    tags: ["apple", "laptop", "new"],
    inStock: false,
    rating: 4.9,
  },
  {
    name: "Office Chair Pro",
    price: 350,
    category: "furniture",
    tags: ["ergonomic", "office"],
    inStock: true,
    rating: 4.3,
  },
  {
    name: "Standing Desk",
    price: 650,
    category: "furniture",
    tags: ["office", "adjustable"],
    inStock: true,
    rating: 4.5,
  },
  {
    name: "Nike Running Shoes",
    price: 120,
    category: "sports",
    tags: ["nike", "running", "sale"],
    inStock: true,
    rating: 4.4,
  },
  {
    name: "Adidas Hoodie",
    price: 85,
    category: "clothing",
    tags: ["adidas", "casual", "sale"],
    inStock: true,
    rating: 4.2,
  },
  {
    name: "Instant Noodles Pack",
    price: 5,
    category: "food",
    tags: ["instant", "budget"],
    inStock: true,
    rating: 3.8,
  },
  {
    name: "Protein Powder 2kg",
    price: 65,
    category: "sports",
    tags: ["nutrition", "fitness"],
    inStock: false,
    rating: 4.1,
  },
  {
    name: "Gaming Keyboard",
    price: 180,
    category: "tech",
    tags: ["gaming", "mechanical"],
    inStock: true,
    rating: 4.7,
  },
];

async function seedDatabase() {
  await Product.deleteMany({});
  await Product.insertMany(seedProducts);
  console.log(`Seeded ${seedProducts.length} products`);
}

// ============================================================
// TODO 2.1 - Filter theo category (exact match)
// ============================================================
// Yêu cầu:
// 1. Tìm tất cả products thuộc category "tech"
// 2. Log số lượng và tên từng product
// 3. Dùng .lean() vì chỉ cần đọc data
//
// Gợi ý:
//   const techProducts = await Product.find({ category: "tech" }).lean();

async function filterByCategory(category) {
  console.log(`\nProducts in category: "${category}"`);
  // TODO 2.1: Find products by category, log results
  const products = await Product.find({
    category,
  }).lean();

  console.log(`Found ${products.length} products`);

  products.forEach((product) => {
    console.log(`- ${product.name}`);
  });

  return products;
}

// ============================================================
// TODO 2.2 - Filter theo price range với $gte/$lte
// ============================================================
// Yêu cầu:
// 1. Tìm products có price >= minPrice VÀ <= maxPrice
// 2. Sort kết quả theo price tăng dần
// 3. Log: "<name>: $<price>"
//
// Gợi ý:
//   const products = await Product.find({
//     price: { $gte: minPrice, $lte: maxPrice }
//   }).sort({ price: 1 }).lean();
//
// Test: filterByPriceRange(100, 800) -> nên ra Samsung, Standing Desk, Gaming Keyboard, Office Chair

async function filterByPriceRange(minPrice, maxPrice) {
  console.log(`\nProducts priced $${minPrice} - $${maxPrice}:`);
  // TODO 2.2: Find products within price range, sorted by price asc
  const products = await Product.find({
    price: { $gte: minPrice, $lte: maxPrice },
  })
    .sort({ price: 1 })
    .lean();

  products.forEach((product) => {
    console.log(`${product.name}: $${product.price}`);
  });

  return products;
}

// ============================================================
// TODO 2.3 - Tìm kiếm bằng $regex (case-insensitive)
// ============================================================
// Yêu cầu:
// 1. Tìm products có name chứa keyword (không phân biệt hoa thường)
// 2. Log số kết quả và tên từng product
//
// Gợi ý:
//   const products = await Product.find({
//     name: { $regex: keyword, $options: "i" }
//   }).lean();
//   // hoặc: { name: new RegExp(keyword, "i") }
//
// Test: searchByName("pro") -> nên ra "iPhone 15 Pro", "Office Chair Pro", "Protein Powder 2kg"

async function searchByName(keyword) {
  console.log(`\nSearch results for: "${keyword}"`);
  // TODO 2.3: Search products by name (case-insensitive)
  const products = await Product.find({
    name: {
      $regex: keyword,
      $options: "i",
    },
  }).lean();

  console.log(`Found ${products.length} products`);

  products.forEach((product) => {
    console.log(`- ${product.name}`);
  });

  return products;
}

// ============================================================
// TODO 2.4 - Filter với $in (nhiều values)
// ============================================================
// Yêu cầu:
// 1. Nhận vào array categories
// 2. Tìm products thuộc BẤT KỲ category nào trong array
// 3. Sort theo category, sau đó theo name
// 4. Log theo nhóm category
//
// Gợi ý:
//   const products = await Product.find({
//     category: { $in: categories }
//   }).sort({ category: 1, name: 1 }).lean();
//
// Test: filterByCategories(["sports", "clothing"]) -> Nike shoes, Adidas hoodie, Protein powder

async function filterByCategories(categories) {
  console.log(`\nProducts in categories: ${categories.join(", ")}`);
  // TODO 2.4: Find products in multiple categories using $in
  const products = await Product.find({
    category: { $in: categories },
  })
    .sort({ category: 1, name: 1 })
    .lean();

  let currentCategory = "";

  products.forEach((product) => {
    if (currentCategory !== product.category) {
      currentCategory = product.category;
      console.log(`\n${currentCategory}`);
    }

    console.log(`- ${product.name}`);
  });

  return products;
}

// ============================================================
// TODO 2.5 - Pagination (skip + limit + sort + countDocuments)
// ============================================================
// Yêu cầu:
// Implement hàm getProductsPaginated({ page, limit, sort, filter })
// Trả về object có format:
// {
//   data: [...products],
//   pagination: {
//     page: 1,
//     limit: 3,
//     total: 10,
//     totalPages: 4,
//     hasNext: true,
//     hasPrev: false,
//   }
// }
//
// Gợi ý:
//   const skip = (page - 1) * limit;
//   const [data, total] = await Promise.all([
//     Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
//     Product.countDocuments(filter),
//   ]);
//
// Test: page=1, limit=3, sort="-price" -> 3 products đắt nhất
// Test: page=2, limit=3, sort="-price" -> 3 products tiếp theo

async function getProductsPaginated({
  page = 1,
  limit = 3,
  sort = "-createdAt",
  filter = {},
} = {}) {
  // TODO 2.5: Implement pagination with countDocuments
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
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

// ============================================================
// TODO 2.6 - Select specific fields
// ============================================================
// Yêu cầu:
// 1. Lấy tất cả products nhưng chỉ include: name, price, category
// 2. Exclude: _id (dùng "-_id"), tags, inStock, rating, timestamps
// 3. Log kết quả để thấy rõ chỉ có 3 fields
//
// Gợi ý:
//   const products = await Product.find()
//     .select("name price category -_id")
//     .lean();
//   // Hoặc: .select({ name: 1, price: 1, category: 1, _id: 0 })
//
// Câu hỏi: khi nào nên dùng select()? (gợi ý: list API vs detail API)
// Khi: - API trả về danh sách, Dashboard, Search API, và khi không muốn trả về các field lớn hoặc nhạy cảm

async function getProductsMinimal() {
  console.log("\nProducts (name, price, category only):");
  // TODO 2.6: Select only specific fields
  const products = await Product.find()
    .select("name price category -_id")
    .lean();

  console.log(products);

  return products;
}

// ============================================================
// TODO 2.7 - So sánh .lean() và không có .lean()
// ============================================================
// Yêu cầu:
// 1. Query cùng 1 product với và không có .lean()
// 2. Log typeof result cho cả hai
// 3. Thử gọi .save() trên kết quả có lean và không có lean
// 4. Dùng console.time() để đo thời gian cho cả hai khi query toàn bộ collection
//
// Gợi ý:
//   const withLean    = await Product.findOne().lean();
//   const withoutLean = await Product.findOne();
//
//   console.log("With lean - constructor:", withLean.constructor.name);      // "Object"
//   console.log("Without lean - constructor:", withoutLean.constructor.name); // "model"
//
//   // Benchmark
//   console.time("without lean");
//   await Product.find();
//   console.timeEnd("without lean");
//
//   console.time("with lean");
//   await Product.find().lean();
//   console.timeEnd("with lean");

async function compareLean() {
  console.log("\n--- .lean() comparison ---");
  // TODO 2.7: Compare lean vs non-lean, measure time difference
  const withLean = await Product.findOne().lean();
  const withoutLean = await Product.findOne();

  console.log("With lean - constructor:", withLean.constructor.name); // "Object"
  console.log("Without lean - constructor:", withoutLean.constructor.name); // "model"

  // Benchmark
  console.time("without lean");
  await Product.find();
  console.timeEnd("without lean");

  console.time("with lean");
  await Product.find().lean();
  console.timeEnd("with lean");
}

// ============================================================
// TODO 2.8 - Aggregate: stats theo category
// ============================================================
// Yêu cầu:
// Dùng Product.aggregate() để tính:
// - Số lượng sản phẩm mỗi category
// - Giá trung bình mỗi category
// - Giá cao nhất mỗi category
// Sort kết quả theo số lượng giảm dần
//
// Output mong đợi:
//   Category: tech     | count: 4 | avgPrice: $819.25 | maxPrice: $1299
//   Category: sports   | count: 2 | avgPrice: $92.50  | maxPrice: $120
//   ...
//
// Gợi ý:
//   const stats = await Product.aggregate([
//     {
//       $group: {
//         _id: "$category",
//         count:    { $sum: 1 },
//         avgPrice: { $avg: "$price" },
//         maxPrice: { $max: "$price" },
//       }
//     },
//     { $sort: { count: -1 } },
//   ]);
//
// Câu hỏi tư duy:
//   - aggregate() có dùng được .lean() không? Tại sao?
//     Không. Vì Aggregate luôn trả về plain JavaScript object, nên không cần .lean()
//   - aggregate() và find() khác nhau về performance khi nào?
//     Khi cần tính toán, group, join, pipeline nhiều bước hoặc thống kê dữ liệu

async function getCategoryStats() {
  console.log("\nCategory Statistics:");
  // TODO 2.8: Aggregate stats per category
  const stats = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  stats.forEach((item) => {
    console.log(
      `Category: ${item._id.padEnd(10)} | count: ${item.count} | avgPrice: $${item.avgPrice.toFixed(2)} | maxPrice: $${item.maxPrice}`,
    );
  });

  return stats;
}

// ============================================================
// CONNECT & RUN
// ============================================================

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected:", mongoose.connection.host);
}

async function run() {
  console.log("=".repeat(50));
  console.log("Day 4 - Exercise 02: Advanced Queries");
  console.log("=".repeat(50));

  await connectDB();
  await seedDatabase();

  // Chạy từng bài
  await filterByCategory("tech");
  await filterByPriceRange(100, 800);
  await searchByName("pro");
  await filterByCategories(["sports", "clothing"]);

  // Pagination
  console.log("\n--- TODO 2.5: Pagination ---");
  const page1 = await getProductsPaginated({
    page: 1,
    limit: 3,
    sort: "-price",
  });
  console.log("Page 1 of", page1?.pagination?.totalPages);
  page1?.data?.forEach((p) => console.log(` - ${p.name}: $${p.price}`));
  console.log("Pagination info:", page1?.pagination);

  const page2 = await getProductsPaginated({
    page: 2,
    limit: 3,
    sort: "-price",
  });
  console.log("\nPage 2:");
  page2?.data?.forEach((p) => console.log(` - ${p.name}: $${p.price}`));

  await getProductsMinimal();
  await compareLean();
  await getCategoryStats();

  console.log("\nAll done.");
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
