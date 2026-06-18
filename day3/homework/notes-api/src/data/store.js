/**
 * In-memory store cho users và notes
 *
 * TODO: Implement tất cả các hàm dưới đây
 * Đây là tầng data duy nhất - service không được tự thao tác với arrays
 */

let users = [];
let nextUserId = 1;

let notes = [];
let nextNoteId = 1;

// ---- Users ----

const users_findByEmail = (email) => {
  // TODO: trả về user có email tương ứng, hoặc undefined
  return users.find((user) => user.email === email);
};

const users_findById = (id) => {
  // TODO: trả về user có id tương ứng, hoặc undefined
  return users.find((user) => user.id === id);
};

const users_create = ({ name, email, hashedPassword, role = "user" }) => {
  // TODO: tạo user mới, push vào array, return user (bao gồm password hash)
  const user = {
    id: nextUserId++,
    name,
    email,
    password: hashedPassword,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.push(user);
  return user;
};

const users_update = (id, data) => {
  // TODO: update user theo id, return user đã update hoặc null
  const user = users.find((user) => user.id === id);

  if (!user) return null;

  Object.assign(user, data, {
    updatedAt: new Date(),
  });

  return user;
};

const users_getAll = () => {
  // TODO: return tất cả users
  return [...users];
};

const users_remove = (id) => {
  // TODO: xóa user theo id, return true/false
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) return false;

  users.splice(index, 1);
  return true;
};

// ---- Notes ----

const notes_getAll = (filter = {}) => {
  // TODO: return notes theo filter
  // filter có thể có: userId (chỉ lấy notes của user đó), tag (lọc theo tag)
  let result = [...notes];

  if (filter.userId) {
    result = result.filter((note) => note.userId === filter.userId);
  }
  if (filter.tag) {
    result = result.filter((note) => note.tags.includes(filter.tag));
  }
  return result;
};

const notes_findById = (id) => {
  // TODO: trả về note hoặc undefined
  return notes.find((note) => note.id === id);
};

const notes_create = ({ userId, title, content, tags = [] }) => {
  // TODO: tạo note mới với: id, userId, title, content, tags, createdAt, updatedAt
  const note = {
    id: nextNoteId++,
    userId,
    title,
    content,
    tags,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  notes.push(note);

  return note;
};

const notes_update = (id, data) => {
  // TODO: update note, set updatedAt: new Date(), return note đã update hoặc null
  const note = notes.find((note) => note.id === id);

  if (!note) return null;

  Object.assign(note, data, {
    updatedAt: new Date(),
  });

  return note;
};

const notes_remove = (id) => {
  // TODO: xóa note, return true/false
  const index = notes.findIndex((note) => note.id === id);

  if (index === -1) return false;

  notes.splice(index, 1);
  return true;
};

// Seed admin khi import lần đầu (gọi từ app startup)
const seedAdmin = async () => {
  const bcrypt = require("bcrypt");
  const hashedPassword = await bcrypt.hash("Admin@123", 10);
  const admin = users_create({
    name: "Admin",
    email: "admin@example.com",
    hashedPassword,
    role: "admin",
  });
  console.log(`Admin seeded: admin@example.com / Admin@123 (id: ${admin?.id})`);
};

module.exports = {
  users: {
    findByEmail: users_findByEmail,
    findById: users_findById,
    create: users_create,
    update: users_update,
    getAll: users_getAll,
    remove: users_remove,
  },
  notes: {
    getAll: notes_getAll,
    findById: notes_findById,
    create: notes_create,
    update: notes_update,
    remove: notes_remove,
  },
  seedAdmin,
};
