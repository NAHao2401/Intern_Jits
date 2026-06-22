/**
 * Homework: Product Store — Card List UI
 * Day 6 - Bài tập về nhà
 *
 * Xây dựng trang danh sách sản phẩm mini kết hợp:
 *   - Component tree: App → ProductList → ProductCard
 *   - Props truyền data và callback
 *   - useState quản lý filter, sort, cart
 *   - useMemo cache kết quả filter + sort
 *   - useCallback tránh re-render thừa
 *   - useRef auto-focus search input
 *
 * Cấu trúc file:
 *   homework/card-list/src/
 *   ├── components/
 *   │   ├── ProductCard.jsx      ← TODO
 *   │   └── ProductList.jsx      ← TODO
 *   ├── App.jsx                  ← file này
 *   ├── App.css                  ← tự viết CSS
 *   └── main.jsx                 ← entry point (copy từ Vite template)
 *
 * Chạy:
 *   cd homework/card-list
 *   npm install
 *   npm run dev
 */

import { useState, useMemo, useCallback } from "react";
// TODO: import ProductList từ "./components/ProductList"
import ProductList from "./components/ProductList";
import "./App.css";

// ─── Data mẫu (hardcode) ─────────────────────────────────────────────────────

const products = [
  {
    id: 1,
    name: "Laptop Dell XPS 13",
    price: 28000000,
    category: "laptop",
    rating: 4,
    inStock: true,
  },
  {
    id: 2,
    name: "Chuột Logitech MX Master",
    price: 2500000,
    category: "peripheral",
    rating: 5,
    inStock: true,
  },
  {
    id: 3,
    name: "Tai nghe Sony WH-1000XM5",
    price: 8000000,
    category: "audio",
    rating: 4,
    inStock: false,
  },
  {
    id: 4,
    name: "Bàn phím Keychron K2",
    price: 2200000,
    category: "peripheral",
    rating: 3,
    inStock: true,
  },
  {
    id: 5,
    name: "Màn hình LG 27UL850",
    price: 12000000,
    category: "monitor",
    rating: 4,
    inStock: false,
  },
  {
    id: 6,
    name: "Webcam Logitech C920",
    price: 1800000,
    category: "peripheral",
    rating: 3,
    inStock: true,
  },
  {
    id: 7,
    name: "Ổ cứng SSD Samsung 1TB",
    price: 3500000,
    category: "storage",
    rating: 5,
    inStock: true,
  },
  {
    id: 8,
    name: "Loa JBL Flip 6",
    price: 2800000,
    category: "audio",
    rating: 4,
    inStock: true,
  },
  {
    id: 9,
    name: "Laptop MacBook Air M2",
    price: 32000000,
    category: "laptop",
    rating: 5,
    inStock: false,
  },
  {
    id: 10,
    name: "Chuột Razer DeathAdder",
    price: 1200000,
    category: "peripheral",
    rating: 4,
    inStock: true,
  },
];

// ─── App Component ────────────────────────────────────────────────────────────
//
// TODO: Implement App component với các tính năng sau:
//
// 1. State:
//    - search (string): từ khóa tìm kiếm
//    - filterCategory (string): "all" | "laptop" | "peripheral" | "audio" | ...
//    - showInStockOnly (boolean): chỉ hiện còn hàng
//    - sortBy (string): "name" | "price-asc" | "price-desc" | "rating"
//    - cart (array): danh sách id sản phẩm trong giỏ hàng
//
// 2. useMemo — filteredAndSortedProducts:
//    - Filter theo search (name chứa keyword, case-insensitive)
//    - Filter theo category (nếu không phải "all")
//    - Filter theo inStock (nếu showInStockOnly === true)
//    - Sort theo sortBy
//    - Dependencies: [search, filterCategory, showInStockOnly, sortBy]
//    (products là const nên không cần trong deps)
//
// 3. useCallback — handleAddToCart:
//    - Thêm product id vào cart (nếu chưa có)
//    - setCart(prev => prev.includes(id) ? prev : [...prev, id])
//
// 4. useCallback — handleRemoveFromCart:
//    - Xóa product id khỏi cart
//    - setCart(prev => prev.filter(cartId => cartId !== id))
//
// 5. UI Layout:
//    - Header: tiêu đề + giỏ hàng (hiển thị số lượng)
//    - Search input (auto-focus bằng useRef trong ProductList)
//    - Filter buttons: All | laptop | peripheral | audio | monitor | storage
//    - Checkbox: "Chỉ còn hàng"
//    - Sort dropdown: Theo tên | Giá tăng | Giá giảm | Rating
//    - ProductList component
//    - Hiển thị: "{n} sản phẩm"

function App() {
  // TODO: khai báo state (search, filterCategory, showInStockOnly, sortBy, cart)
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [cart, setCart] = useState([]);

  // TODO: useMemo cho filteredAndSortedProducts
  const filteredAndSortedProducts = useMemo(() => {
    console.log("Filtering and sorting products...");

    const keyword = search.toLowerCase().trim();

    const filtered = products
      .filter((product) => product.name.toLowerCase().includes(keyword))
      .filter(
        (product) =>
          filterCategory === "all" || product.category === filterCategory,
      )
      .filter((product) => (showInStockOnly ? product.inStock : true));

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "price-asc") {
        return a.price - b.price;
      }

      if (sortBy === "price-desc") {
        return b.price - a.price;
      }

      if (sortBy === "rating") {
        return b.rating - a.rating;
      }

      return 0;
    });
  }, [search, filterCategory, showInStockOnly, sortBy]);
  // TODO: useCallback cho handleAddToCart, handleRemoveFromCart
  const handleAddToCart = useCallback((id) => {
    setCart((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const handleRemoveFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((cartId) => cartId !== id));
  }, []);
  // Lấy danh sách categories unique từ data
  const categories = ["all", ...new Set(products.map((p) => p.category))];

  return (
    <div className="app">
      <header className="header">
        {/* TODO: Implement UI */}
        <div>
          <h1>Product Store</h1>
          <p>Danh sách sản phẩm mini bằng React</p>
        </div>

        <div className="cart-box">
          🛒 Giỏ hàng: <strong>{cart.length}</strong>
        </div>
      </header>
      <p>TODO: Implement theo yêu cầu trên</p>
      <section className="controls">
        <input
          className="search-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          autoFocus
        />

        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={filterCategory === category ? "active" : ""}
            >
              {category === "all" ? "All" : category}
            </button>
          ))}
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={showInStockOnly}
            onChange={(e) => setShowInStockOnly(e.target.checked)}
          />
          Chỉ còn hàng
        </label>

        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Theo tên</option>
          <option value="price-asc">Giá tăng</option>
          <option value="price-desc">Giá giảm</option>
          <option value="rating">Rating</option>
        </select>
      </section>
      <p className="result-count">
        Hiển thị {filteredAndSortedProducts.length} sản phẩm
      </p>

      <ProductList
        products={filteredAndSortedProducts}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
      />
    </div>
  );
}

export default App;
