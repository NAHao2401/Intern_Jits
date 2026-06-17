/**
 * In-memory data store cho Products
 * Day 2 - Exercise 04
 *
 * Module này đóng vai trò "database" đơn giản.
 * Tất cả data lưu trong mảng, mất khi restart server.
 */

// ============================================================
// Data ban đầu
// ============================================================

let products = [
  {
    id: 1,
    name: "Laptop Dell XPS 15",
    price: 35000000,
    category: "tech",
    description: "Laptop cao cấp cho lập trình viên",
    inStock: true,
    quantity: 10,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    price: 28000000,
    category: "tech",
    description: "Điện thoại flagship của Apple",
    inStock: true,
    quantity: 25,
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: 3,
    name: "Bàn làm việc standing desk",
    price: 8500000,
    category: "furniture",
    description: "Bàn đứng thông minh, điều chỉnh được độ cao",
    inStock: false,
    quantity: 0,
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
  },
  {
    id: 4,
    name: "Ghế văn phòng Herman Miller",
    price: 15000000,
    category: "furniture",
    description: "Ghế ergonomic cao cấp",
    inStock: true,
    quantity: 5,
    createdAt: new Date("2024-01-04"),
    updatedAt: new Date("2024-01-04"),
  },
  {
    id: 5,
    name: "Màn hình 4K LG 27 inch",
    price: 12000000,
    category: "tech",
    description: "Màn hình 4K cho đồ họa và lập trình",
    inStock: true,
    quantity: 8,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
  },
];

let nextId = 6;

// ============================================================
// Data access functions
// ============================================================

/**
 * Lấy tất cả products, có hỗ trợ filter và sort
 * @param {Object} options
 * @param {string} [options.category]   - Lọc theo category
 * @param {boolean} [options.inStock]   - Lọc theo inStock
 * @param {number} [options.minPrice]   - Giá tối thiểu
 * @param {number} [options.maxPrice]   - Giá tối đa
 * @param {string} [options.search]     - Tìm kiếm trong name/description
 * @param {string} [options.sort]       - Field để sort (name|price|createdAt)
 * @param {string} [options.order]      - "asc" hoặc "desc" (default: "asc")
 * @returns {Array} Mảng products sau filter/sort
 */
const getAll = (options = {}) => {
  let result = [...products];

  // Filter theo category
  if (options.category) {
    result = result.filter(p => p.category === options.category);
  }

  // Filter theo inStock
  if (options.inStock !== undefined) {
    const inStockBool = options.inStock === "true" || options.inStock === true;
    result = result.filter(p => p.inStock === inStockBool);
  }

  // Filter theo price range
  if (options.minPrice !== undefined) {
    const min = Number(options.minPrice);
    result = result.filter(p => p.price >= min);
  }
  if (options.maxPrice !== undefined) {
    const max = Number(options.maxPrice);
    result = result.filter(p => p.price <= max);
  }

  // Tìm kiếm trong name và description
  if (options.search) {
    const keyword = options.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(keyword) ||
      (p.description && p.description.toLowerCase().includes(keyword))
    );
  }

  // Sort
  if (options.sort) {
    const order = options.order === "desc" ? -1 : 1;
    result.sort((a, b) => {
      if (a[options.sort] < b[options.sort]) return -1 * order;
      if (a[options.sort] > b[options.sort]) return 1 * order;
      return 0;
    });
  }

  return result;
};

/**
 * Lấy một product theo id
 * @param {number|string} id
 * @returns {Object|undefined}
 */
const getById = (id) => {
  return products.find(p => p.id === Number(id));
};

/**
 * Tạo product mới
 * @param {Object} data - { name, price, category, description, inStock, quantity }
 * @returns {Object} Product vừa tạo
 */
const create = (data) => {
  const now = new Date();
  const product = {
    id: nextId++,
    name: data.name,
    price: data.price,
    category: data.category || "uncategorized",
    description: data.description || "",
    inStock: data.inStock !== undefined ? data.inStock : true,
    quantity: data.quantity || 0,
    createdAt: now,
    updatedAt: now,
  };
  products.push(product);
  return product;
};

/**
 * Thay thế hoàn toàn product (PUT)
 * @param {number|string} id
 * @param {Object} data - Toàn bộ fields mới
 * @returns {Object|null} Product đã update, null nếu không tìm thấy
 */
const replace = (id, data) => {
  const index = products.findIndex(p => p.id === Number(id));
  if (index === -1) return null;

  const updatedProduct = {
    id: Number(id),
    name: data.name,
    price: data.price,
    category: data.category || "uncategorized",
    description: data.description || "",
    inStock: data.inStock !== undefined ? data.inStock : true,
    quantity: data.quantity || 0,
    createdAt: products[index].createdAt, // giữ nguyên createdAt
    updatedAt: new Date(),
  };

  products[index] = updatedProduct;
  return updatedProduct;
};

/**
 * Cập nhật một phần product (PATCH)
 * @param {number|string} id
 * @param {Object} data - Chỉ các field cần update
 * @returns {Object|null} Product đã update, null nếu không tìm thấy
 */
const update = (id, data) => {
  const index = products.findIndex(p => p.id === Number(id));
  if (index === -1) return null;

  // Không cho phép thay đổi id và createdAt
  const { id: _id, createdAt: _createdAt, ...allowedFields } = data;

  products[index] = {
    ...products[index],
    ...allowedFields,
    updatedAt: new Date(),
  };

  return products[index];
};

/**
 * Xóa product theo id
 * @param {number|string} id
 * @returns {boolean} true nếu xóa thành công, false nếu không tìm thấy
 */
const remove = (id) => {
  const index = products.findIndex(p => p.id === Number(id));
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
};

/**
 * Lấy danh sách categories hiện có
 * @returns {Array<string>} Mảng category unique
 */
const getCategories = () => {
  return [...new Set(products.map(p => p.category))];
};

/**
 * Lấy thống kê cơ bản
 * @returns {Object} Stats
 */
const getStats = () => {
  return {
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
    byCategory: products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {}),
  };
};

module.exports = { getAll, getById, create, replace, update, remove, getCategories, getStats };
