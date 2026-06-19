/**
 * Auth Service
 * Business logic cho đăng ký và đăng nhập
 *
 * So với Day 3: thay usersStore (in-memory) bằng Mongoose User model
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// ============================================================
// TODO: register
// ============================================================
// Yêu cầu:
// 1. Kiểm tra email đã tồn tại chưa
//    - Nếu có: throw error với statusCode = 409
// 2. Hash password với bcrypt (saltRounds = 10)
// 3. Tạo user mới với User.create()
// 4. Trả về user (không có password)
//
// Hint: User.findOne({ email })
// Hint: bcrypt.hash(password, 10)
// Hint: User.create({ name, email, password: hashedPassword })
// Hint: Dùng destructuring để loại password khỏi response:
//       const { password: _, ...userWithoutPassword } = user.toObject();
//       (cần .toObject() vì user là Mongoose Document, không phải plain object)
//
// Câu hỏi tư duy:
//   - Tại sao cần .toObject() trước khi destructure?
//      toObject() sẽ chuyển document thành object để dễ destructuring, serialize, ...
//   - Nếu schema có select:false thì create() có trả về password không?
//      Có. vì select: false chỉ ảnh hưởng đến các truy vấn (find, findOne, ...) không ảnh hướng đến các document vừa được tạo

async function register({ name, email, password }) {
  // TODO: implement register
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashPassword,
  });

  const { password: _, ...userWithoutPassword } = user.toObject;
  return userWithoutPassword;
}

// ============================================================
// TODO: login
// ============================================================
// Yêu cầu:
// 1. Tìm user theo email — PHẢI dùng .select("+password") để lấy password field
//    (vì schema có select: false)
// 2. Nếu không tìm thấy user -> throw 401 "Invalid email or password"
//    (không nói rõ email sai hay password sai -> tránh user enumeration)
// 3. Verify password với bcrypt.compare(password, user.password)
// 4. Nếu sai password -> throw 401 "Invalid email or password"
// 5. Tạo JWT với payload { userId: user._id, email: user.email, role: user.role }
// 6. Trả về { token, expiresIn: process.env.JWT_EXPIRES_IN }
//
// Hint: User.findOne({ email }).select("+password")
//       -> "+password" override select:false, lấy thêm password field
// Hint: const isValid = await bcrypt.compare(plainPassword, user.password)
// Hint: jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
//
// QUAN TRỌNG: dùng user._id (MongoDB ObjectId) thay vì user.id khi sign JWT
//             hoặc String(user._id) để chắc là string

async function login({ email, password }) {
  // TODO: implement login
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

  return {
    token,
    expiresIn: process.env.JWT_EXPIRES_IN,
  };
}

module.exports = { register, login };
