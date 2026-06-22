/**
 * Bài 2: Props & Component Tree
 * Day 6 - React cơ bản
 *
 * Mục tiêu:
 *   - Truyền và nhận props đúng type (string, number, boolean, array, function)
 *   - Dùng destructuring trong parameter
 *   - Default props
 *   - Props children
 *   - Tổ chức component tree: App → Parent → Child
 *
 * Chạy: npm run dev
 * Copy file này vào src/App.jsx để test
 */

// ============================================================
// TODO 2.1: ProductCard component
// ============================================================
//
// Tạo component ProductCard nhận props:
//   - name (string) — tên sản phẩm
//   - price (number) — giá (VND)
//   - category (string) — danh mục
//   - inStock (boolean) — còn hàng không
//
// Yêu cầu:
//   - Destructure props trong parameter: function ProductCard({ name, price, ... })
//   - Format giá: price.toLocaleString("vi-VN") + " VND"
//     Ví dụ: 25000000 → "25.000.000 VND"
//   - Nếu inStock === true: button "Mua ngay" enabled (màu xanh)
//   - Nếu inStock === false: button "Hết hàng" disabled (màu xám)
//   - Hiển thị category dạng badge
//
// Gợi ý cấu trúc:
//   function ProductCard({ name, price, category, inStock }) {
//     return (
//       <div className="product-card">
//         <h3>{name}</h3>
//         <p className="price">{...format giá...}</p>
//         <span className="category-badge">{category}</span>
//         <button
//           disabled={...}
//           style={{ backgroundColor: inStock ? "#4CAF50" : "#ccc" }}
//         >
//           {inStock ? "Mua ngay" : "Hết hàng"}
//         </button>
//       </div>
//     );
//   }

// TODO 2.1 — Implement ProductCard bên dưới:
function ProductCard({ name, price, category, inStock }) {
  return (
    <div
      className="product-card"
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        width: 220,
      }}
    >
      <h3>{name}</h3>

      <p className="price" style={{ fontWeight: "bold" }}>
        {price.toLocaleString("vi-VN")} VND
      </p>

      <span
        style={{
          background: "#eee",
          padding: "4px 8px",
          borderRadius: 4,
        }}
      >
        {category}
      </span>

      <br />
      <br />

      <button
        disabled={!inStock}
        style={{
          backgroundColor: inStock ? "#4CAF50" : "#ccc",
          color: "white",
          border: "none",
          padding: "8px 12px",
          cursor: inStock ? "pointer" : "not-allowed",
        }}
      >
        {inStock ? "Mua ngay" : "Hết hàng"}
      </button>
    </div>
  );
}
// ============================================================
// TODO 2.2: ProductCard với default props và callback
// ============================================================
//
// Mở rộng ProductCard (hoặc tạo ProductCardPro) thêm props:
//   - discount (number, default = 0) — phần trăm giảm giá
//   - onAddToCart (function) — callback khi click "Mua ngay"
//
// Yêu cầu:
//   - Default value cho discount trong destructuring: { discount = 0, ... }
//   - Nếu discount > 0:
//     + Hiển thị giá gốc có gạch ngang: <s>25.000.000 VND</s>
//     + Hiển thị giá sau giảm: price * (1 - discount / 100)
//     + Hiển thị badge "-{discount}%"
//   - Khi click "Mua ngay", gọi onAddToCart({ name, price, finalPrice })
//   - Nếu onAddToCart không được truyền, button vẫn hoạt động nhưng không crash
//     Gợi ý: onClick={() => onAddToCart?.({ name, price, finalPrice })}
//
// Kết quả mong đợi (discount = 20, price = 25000000):
//   Laptop XYZ
//   <s>25.000.000 VND</s>  20.000.000 VND  -20%
//   [Mua ngay]

// TODO 2.2 — Implement bên dưới:
function ProductCardPro({
  name,
  price,
  category,
  inStock,
  discount = 0,
  onAddToCard,
}) {
  const finalPrice = price * (1 - discount / 100);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        width: 240,
      }}
    >
      <h3>{name}</h3>

      {discount > 0 ? (
        <>
          <p>
            <s>{price.toLocaleString("vi-VN")} VND</s>
          </p>

          <p style={{ color: "red", fontWeight: "bold" }}>
            {finalPrice.toLocaleString("vi-VN")} VND
          </p>

          <span
            style={{
              background: "red",
              color: "white",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            -{discount}%
          </span>
        </>
      ) : (
        <p style={{ fontWeight: "bold" }}>
          {price.toLocaleString("vi-VN")} VND
        </p>
      )}

      <br />

      <span
        style={{
          background: "#eee",
          padding: "4px 8px",
          borderRadius: 4,
        }}
      >
        {category}
      </span>

      <br />
      <br />

      <button
        disabled={!inStock}
        style={{
          backgroundColor: inStock ? "#4CAF50" : "#ccc",
          color: "white",
          border: "none",
          padding: "8px 12px",
          cursor: inStock ? "pointer" : "not-allowed",
        }}
        onClick={() =>
          onAddToCard?.({
            name,
            price,
            finalPrice,
          })
        }
      >
        {inStock ? "Mua ngay" : "Hết hàng"}
      </button>
    </div>
  );
}

// ============================================================
// TODO 2.3: Card wrapper dùng children
// ============================================================
//
// Tạo component Card nhận props: title, children
//
// Yêu cầu:
//   - Card là wrapper component — render {children} bên trong
//   - Có border, padding, border-radius
//   - Title hiển thị ở trên cùng
//
// Gợi ý:
//   function Card({ title, children }) {
//     return (
//       <div style={{
//         border: "1px solid #ddd",
//         borderRadius: 8,
//         padding: 16,
//         marginBottom: 16,
//       }}>
//         {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
//         {children}
//       </div>
//     );
//   }
//
// Dùng:
//   <Card title="Thông tin">
//     <p>Nội dung bất kỳ</p>
//     <button>Action</button>
//   </Card>

// TODO 2.3 — Implement Card bên dưới:
function Card({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
      }}
    >
      {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}

      {children}
    </div>
  );
}

// ============================================================
// App — Render tất cả components để test
// ============================================================

function App() {
  const handleAddToCart = (product) => {
    console.log("Added to cart:", product);
    alert(
      `Đã thêm "${product.name}" vào giỏ hàng!\nGiá: ${product.finalPrice.toLocaleString("vi-VN")} VND`,
    );
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "sans-serif",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <h1>Day 6 — Exercise 02: Props</h1>

      <h2>2.1 — ProductCard cơ bản</h2>
      {/* TODO: Uncomment sau khi implement ProductCard */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ProductCard
          name="Laptop Dell XPS 13"
          price={28000000}
          category="laptop"
          inStock={true}
        />
        <ProductCard
          name="Tai nghe Sony WH-1000XM5"
          price={8000000}
          category="audio"
          inStock={false}
        />
        <ProductCard
          name="Chuột Logitech MX Master"
          price={2500000}
          category="peripheral"
          inStock={true}
        />
      </div>

      <h2>2.2 — ProductCard với discount & callback</h2>
      {/* TODO: Uncomment sau khi implement ProductCardPro */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ProductCardPro
          name="Laptop Dell XPS 13"
          price={28000000}
          category="laptop"
          inStock={true}
          discount={15}
          onAddToCard={handleAddToCart}
        />
        <ProductCardPro
          name="Bàn phím Keychron K2"
          price={2200000}
          category="peripheral"
          inStock={true}
          onAddToCard={handleAddToCart}
        />
        <ProductCardPro
          name="Màn hình LG 27UL850"
          price={12000000}
          category="monitor"
          inStock={false}
          discount={10}
        />
      </div>

      <h2>2.3 — Card wrapper (children)</h2>
      {/* TODO: Uncomment sau khi implement Card */}
      <Card title="Thông tin cá nhân">
        <p>Tên: Nguyen Van A</p>
        <p>Email: nguyenvana@example.com</p>
        <button>Chỉnh sửa</button>
      </Card>
      <Card title="Ghi chú">
        <ul>
          <li>Học React JSX</li>
          <li>Làm bài tập Props</li>
          <li>Review code</li>
        </ul>
      </Card>
      <Card>
        <p>Card không có title — chỉ có children</p>
      </Card>
    </div>
  );
}

export default App;

// ─────────────────────────────────────────────────────────────
// CÂU HỎI TƯ DUY (trả lời bằng comment trước khi nộp bài)
// ─────────────────────────────────────────────────────────────
//
// Q1: Props là read-only — tại sao React không cho component con sửa props?
//     Gợi ý: nghĩ về data flow (one-way) và debugging
//
//     YOUR ANSWER: Props chỉ được truyền từ cha xuống con. Nếu component con được phép sửa props thì dữ liệu sẽ thay đổi ở nhiều nơi, gây khó theo dõi và khó debug
//
// Q2: onAddToCart?.() dùng optional chaining.
//     Nếu không dùng ?. và onAddToCart là undefined, chuyện gì xảy ra?
//
//     YOUR ANSWER: Thì React sẽ báo lỗi, và component có thể bị crash
// Q3: So sánh children prop với việc truyền JSX qua named prop:
//       <Card content={<p>Hello</p>} />
//     vs
//       <Card><p>Hello</p></Card>
//     Khi nào dùng cách nào? Ưu nhược điểm?
//
//     YOUR ANSWER: children prop: Dùng khi component đóng vai trò bao bọc nội dung, và chỉ có một vùng nội dung chính
//                         - Ưu điểm: Giống HTML, ngắn gọn và có thể chứa bao nhiều component cũng được
//                         - Nhược điểm: Không phù hợp khi cần nhiều vùng khác nhau
//                  named prop: Dùng khi component có nhiều vùng phân biệt, mỗi vùng có ý nghĩa riêng/
//                         - Ưu điểm: Rõ ràng, nhìn vào là hiểu ngay
//                         - Nhược điểm:JSX hơi dài, nếu chỉ có 1 vùng nội dung thì hơi thừa
// ─────────────────────────────────────────────────────────────
