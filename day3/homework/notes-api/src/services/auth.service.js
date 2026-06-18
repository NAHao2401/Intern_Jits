const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const store = require("../data/store");

/**
 * TODO: Implement register({ name, email, password })
 *
 * Flow:
 * 1. Kiểm tra email đã tồn tại -> throw 409
 * 2. Hash password (saltRounds = 10)
 * 3. Tạo user qua store.users.create(...)
 * 4. Return user (không có password)
 */
async function register({ name, email, password }) {
  // TODO: implement
  const existingUser = store.users.findByEmail(email);

  if (existingUser) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = store.users.create({
    name,
    email,
    hashedPassword,
  });

  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

/**
 * TODO: Implement login({ email, password })
 *
 * Flow:
 * 1. Tìm user theo email (không tìm thấy -> 401 "Invalid email or password")
 * 2. bcrypt.compare(password, user.password) (sai -> 401 cùng message)
 * 3. jwt.sign({ userId, email, role }, secret, { expiresIn })
 * 4. Return { token, expiresIn: "1h" }
 *
 * QUAN TRỌNG: Dùng cùng 1 message cho cả 2 trường hợp sai
 * để tránh user enumeration attack
 */
async function login({ email, password }) {
  // TODO: implement
  const user = store.users.findByEmail(email);

  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
  );

  return {
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  };
}

module.exports = { register, login };
