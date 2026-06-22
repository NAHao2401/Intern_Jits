/**
 * ProductList Component
 * Homework Day 6
 *
 * Nhận props:
 *   - products (array) — danh sách sản phẩm đã filter + sort
 *   - cart (array) — danh sách id sản phẩm trong giỏ
 *   - onAddToCart (function)
 *   - onRemoveFromCart (function)
 */

import { useRef, useEffect } from "react";
// TODO: import ProductCard từ "./ProductCard"
import ProductCard from "./ProductCard";

// ============================================================
// TODO: Implement ProductList
// ============================================================
//
// Yêu cầu:
//
// 1. Render danh sách ProductCard bằng .map()
//    - key prop dùng product.id
//    - Truyền isInCart={cart.includes(product.id)} cho mỗi card
//    - Truyền onAddToCart, onRemoveFromCart
//
// 2. Empty state:
//    - Nếu products.length === 0, hiển thị:
//      "Không tìm thấy sản phẩm nào."
//
// 3. useRef — auto-focus:
//    - Component này KHÔNG có search input
//    - Nhưng nhận thêm prop searchRef (optional) để parent control focus
//    - HOẶC: không cần useRef ở đây nếu đã handle ở App
//
// 4. Grid layout:
//    - Hiển thị dạng grid: 3 columns trên desktop, 2 trên tablet, 1 trên mobile
//    - Dùng CSS Grid hoặc Flexbox
//
// Gợi ý cấu trúc:
//   function ProductList({ products, cart, onAddToCart, onRemoveFromCart }) {
//     if (products.length === 0) {
//       return (
//         <div className="empty-state">
//           <p>Không tìm thấy sản phẩm nào.</p>
//         </div>
//       );
//     }
//
//     return (
//       <div className="product-grid">
//         {products.map(product => (
//           <ProductCard
//             key={product.id}
//             {...product}
//             isInCart={cart.includes(product.id)}
//             onAddToCart={onAddToCart}
//             onRemoveFromCart={onRemoveFromCart}
//           />
//         ))}
//       </div>
//     );
//   }
//
//   export default ProductList;

// TODO — Implement bên dưới:

function ProductList({ products, cart, onAddToCart, onRemoveFromCart }) {
  // TODO: implement
  if (products.length === 0) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "#888",
          border: "1px dashed #ccc",
          borderRadius: 8,
        }}
      >
        <p>Không tìm thấy sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 20,
      }}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          isInCart={cart.includes(product.id)}
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
        />
      ))}
    </div>
  );
}

export default ProductList;
