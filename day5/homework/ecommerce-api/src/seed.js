/**
 * Seed script — tạo dữ liệu mẫu cho E-commerce API
 *
 * Chạy: node src/seed.js
 *
 * Tạo:
 *   - 1 admin user
 *   - 2 customer users
 *   - 3 categories
 *   - 6 products
 */

"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // ─── Users ─────────────────────────────────────────────────────────────

    const [admin, customer1, customer2] = await User.create([
      {
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: "Admin@123456",
        role: "admin",
      },
      {
        firstName: "Alice",
        lastName: "Nguyen",
        email: "alice@example.com",
        password: "Alice@123456",
        role: "customer",
      },
      {
        firstName: "Bob",
        lastName: "Tran",
        email: "bob@example.com",
        password: "Bob@123456",
        role: "customer",
        addresses: [
          { street: "123 Nguyen Hue", city: "Ho Chi Minh", isDefault: true },
        ],
      },
    ]);
    console.log("Created users:", [admin, customer1, customer2].map((u) => u.email));

    // ─── Categories ────────────────────────────────────────────────────────

    const [electronics, clothing, books] = await Category.create([
      { name: "Electronics", description: "Electronic devices and accessories" },
      { name: "Clothing", description: "Fashion and apparel" },
      { name: "Books", description: "Books and educational materials" },
    ]);
    console.log("Created categories:", [electronics, clothing, books].map((c) => c.name));

    // ─── Products ──────────────────────────────────────────────────────────

    const products = await Product.create([
      {
        name: "MacBook Pro 14 inch",
        description: "Apple MacBook Pro with M3 chip",
        price: 45000000,
        category: electronics._id,
        stock: 10,
        images: ["https://example.com/macbook.jpg"],
      },
      {
        name: "iPhone 15 Pro",
        description: "Latest iPhone with titanium design",
        price: 28000000,
        category: electronics._id,
        stock: 25,
      },
      {
        name: "Sony WH-1000XM5 Headphones",
        description: "Industry-leading noise canceling headphones",
        price: 8500000,
        category: electronics._id,
        stock: 15,
      },
      {
        name: "Levi's 501 Original Jeans",
        description: "Classic straight fit jeans",
        price: 1200000,
        category: clothing._id,
        stock: 50,
      },
      {
        name: "Uniqlo Heattech T-Shirt",
        description: "Warm and comfortable t-shirt",
        price: 350000,
        category: clothing._id,
        stock: 100,
      },
      {
        name: "Clean Code by Robert C. Martin",
        description: "A handbook of agile software craftsmanship",
        price: 450000,
        category: books._id,
        stock: 30,
      },
    ]);
    console.log("Created products:", products.map((p) => p.name));

    console.log("\nSeed complete!");
    console.log("\nTest credentials:");
    console.log("  Admin:    admin@example.com / Admin@123456");
    console.log("  Customer: alice@example.com / Alice@123456");
    console.log("  Customer: bob@example.com   / Bob@123456");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

seed();
