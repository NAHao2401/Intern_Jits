/**
 * Bài 3: Render List
 * Day 6 - React cơ bản
 *
 * Mục tiêu:
 *   - Render danh sách bằng .map() với key prop đúng
 *   - Xử lý empty state
 *   - Kết hợp .filter() + .map()
 *   - Hiểu tại sao key quan trọng và khi nào KHÔNG dùng index
 *
 * Chạy: npm run dev
 * Copy file này vào src/App.jsx để test
 */

// ─── Data mẫu ────────────────────────────────────────────────────────────────

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
];

// ============================================================
// TODO 3.1: ProductCard component (reuse từ Bài 2 hoặc viết mới)
// ============================================================
//
// Nhận props: name, price, category, rating, inStock
//
// Yêu cầu:
//   - Format giá VND
//   - Hiển thị rating dạng sao: rating=4 → "★★★★☆"
//     Gợi ý: "★".repeat(rating) + "☆".repeat(5 - rating)
//   - Hiển thị trạng thái: inStock ? "Còn hàng" : "Hết hàng"
//   - Thêm style khác nhau cho còn hàng / hết hàng
//     Gợi ý: opacity: inStock ? 1 : 0.5

// TODO 3.1 — Implement ProductCard bên dưới:
function ProductCard({ name, price, category, rating, inStock }) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        width: 220,
        opacity: inStock ? 1 : 0.5,
      }}
    >
      <h3>{name}</h3>
      <p>{price.toLocaleString("vi-VN")} VND</p>
      <p>Category: {category}</p>
      <p>Rating: {stars}</p>
      <p>{inStock ? "Còn hàng" : "Hết hàng"}</p>
    </div>
  );
}
// ============================================================
// TODO 3.2: ProductList component
// ============================================================
//
// Nhận props: products (array)
//
// Yêu cầu:
//   - Render danh sách ProductCard bằng .map()
//   - key prop dùng product.id (KHÔNG dùng index)
//   - Empty state: nếu products.length === 0, hiển thị:
//     <p>Không có sản phẩm nào.</p>
//
// Gợi ý:
//   function ProductList({ products }) {
//     if (products.length === 0) {
//       return <p>Không có sản phẩm nào.</p>;
//     }
//     return (
//       <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
//         {products.map(product => (
//           <ProductCard key={...} {...product} />
//         ))}
//       </div>
//     );
//   }

// TODO 3.2 — Implement ProductList bên dưới:
function ProductList({ products }) {
  if (products.length === 0) {
    return <p>Không có sản phẩm nào.</p>;
  }

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}

// ============================================================
// TODO 3.3: FilteredProductList — filter + map
// ============================================================
//
// Nhận props: products (array), category (string | "all")
//
// Yêu cầu:
//   - Nếu category === "all": hiển thị tất cả
//   - Nếu category khác: chỉ hiển thị products có category trùng
//   - Dùng .filter() TRƯỚC .map()
//   - Hiển thị số lượng kết quả: "Hiển thị {n} sản phẩm"
//   - Empty state nếu filter ra 0 kết quả
//
// Gợi ý:
//   const filtered = category === "all"
//     ? products
//     : products.filter(p => p.category === category);

// TODO 3.3 — Implement FilteredProductList bên dưới:
function FilteredProductList({ products, category }) {
  const filtered =
    category === "all"
      ? products
      : products.filter((p) => p.category === category);

  return (
    <>
      <p>Hiển thị {filtered.length} sản phẩm</p>
      <ProductList products={filtered} />
    </>
  );
}
// ============================================================
// TODO 3.4: Sorted list
// ============================================================
//
// Nhận props: products (array), sortBy ("name" | "price" | "rating")
//
// Yêu cầu:
//   - Sort products TRƯỚC khi render (KHÔNG mutate mảng gốc!)
//   - Gợi ý: const sorted = [...products].sort(...)
//   - name: sort A-Z (localeCompare)
//   - price: sort thấp → cao
//   - rating: sort cao → thấp
//
// Câu hỏi: Tại sao phải dùng [...products].sort() thay vì products.sort()?
//           (Trả lời trong phần câu hỏi tư duy bên dưới)

// TODO 3.4 — Implement SortedProductList bên dưới:
function SortedProductList({ products, sortBy }) {
  const sorted = [...products].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "price") {
      return a.price - b.price;
    }
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }

    return 0;
  });

  return <ProductList products={sorted} />;
}
// ============================================================
// App — Render tất cả components để test
// ============================================================

function App() {
  return (
    <div
      style={{
        padding: 20,
        fontFamily: "sans-serif",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <h1>Day 6 — Exercise 03: Render List</h1>

      <h2>3.2 — ProductList (tất cả)</h2>
      {/* TODO: Uncomment sau khi implement */}
      <ProductList products={products} />

      <h2>3.2 — ProductList (empty)</h2>
      <ProductList products={[]} />

      <h2>3.3 — FilteredProductList (category: peripheral)</h2>
      <FilteredProductList products={products} category="peripheral" />

      <h2>3.3 — FilteredProductList (category: all)</h2>
      <FilteredProductList products={products} category="all" />

      <h2>3.3 — FilteredProductList (category: phone — empty)</h2>
      <FilteredProductList products={products} category="phone" />

      <h2>3.4 — SortedProductList (by price)</h2>
      <SortedProductList products={products} sortBy="price" />

      <h2>3.4 — SortedProductList (by rating)</h2>
      <SortedProductList products={products} sortBy="rating" />
    </div>
  );
}

export default App;

// ─────────────────────────────────────────────────────────────
// CÂU HỎI TƯ DUY (trả lời bằng comment trước khi nộp bài)
// ─────────────────────────────────────────────────────────────
//
// Q1: Tại sao KHÔNG dùng index làm key khi list có thể thay đổi thứ tự?
//     Cho ví dụ cụ thể bug xảy ra khi dùng index làm key.
//
//     YOUR ANSWER: Vì React dùng key để nhận biết item nào với item nào. Nếu dùng index, khi sort/filter/delete item, index bị thay đổi, React có thể nhầm dữ liệu cũ với dữ liệu mới.
//                  Ví dụ: List A, B, C dùng key 0, 1, 2. Khi xóa A, B thành key 0, C thành key 1, React có theer reuse sai UI/state
//
// Q2: Tại sao products.sort() sai mà phải dùng [...products].sort()?
//     Gợi ý: mutable vs immutable — React so sánh reference
//
//     YOUR ANSWER: products.sort() sẽ thay đổi trực tiếp mảng gốc. Trong React nên tránh mutate dữ liệu gốc vì dễ gây bug, đặc biệt là khi props/state bị sửa trực tiếp
//
// Q3: Nếu list có 1000 items và user filter bằng input text,
//     việc filter + map chạy MỖI LẦN gõ phím có vấn đề không?
//     Nếu có, dùng cái gì để tối ưu? (Gợi ý: đã học ở Phần 5)
//
//     YOUR ANSWER: Có vấn đề nếu list lớn, ví dụ 1000 hoặc nhiều hơn vì mỗi lần user gõ phím lại filter + map lại toàn bộ list. Có thể dùng aggregation + $match + index ở db
//
// ─────────────────────────────────────────────────────────────
