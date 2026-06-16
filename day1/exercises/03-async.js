/**
 * Bài 3: Callback, Promise, Async/Await
 * Day 1 - JavaScript Bất đồng bộ
 */

// ============================================================
// Helper functions (đừng sửa phần này)
// ============================================================

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fake database
const db = {
  users: [
    { id: 1, name: "Alice", teamId: 10 },
    { id: 2, name: "Bob", teamId: 20 },
  ],
  teams: [
    { id: 10, teamName: "Backend", managerId: 100 },
    { id: 20, teamName: "Frontend", managerId: 200 },
  ],
  managers: [
    { id: 100, name: "Charlie", email: "charlie@company.com" },
    { id: 200, name: "Diana", email: "diana@company.com" },
  ],
};

// ============================================================
// Bài 3.1: Chuyển từ callback sang Promise
// ============================================================

// Hàm dùng callback (đừng sửa)
function readFileFake(filename, callback) {
  setTimeout(() => {
    if (filename.endsWith(".txt")) {
      callback(null, `Content of ${filename}`);
    } else {
      callback(new Error("Only .txt files allowed"));
    }
  }, 500);
}

// TODO: Viết hàm readFilePromise(filename) dùng Promise thay vì callback
function readFilePromise(filename) {
  // TODO: wrap readFileFake trong Promise
  return new Promise((resolve, reject) => {
    readFileFake(filename, (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

// Test:
readFilePromise("data.txt").then((content) => console.log(content)); // "Content of data.txt"
readFilePromise("data.json").catch((err) => console.error(err.message)); // "Only .txt files allowed"

// ============================================================
// Bài 3.2: Promise chain
// ============================================================

// TODO: Tạo 3 hàm giả lập API (mỗi hàm delay 500ms):
// getUser(id) -> resolve với user object, reject nếu không tìm thấy
function getUser(id) {
  // TODO
  return new Promise((resolve, reject) => {
    delay(500).then(() => {
      const user = db.users.find((u) => u.id === id);
      if (user) {
        resolve(user);
      } else {
        reject(new Error("User not found"));
      }
    });
  });
}

// getTeam(teamId) -> resolve với team object, reject nếu không tìm thấy
function getTeam(teamId) {
  // TODO
  return new Promise((resolve, reject) => {
    delay(500).then(() => {
      const team = db.teams.find((t) => t.id === teamId);
      if (team) {
        resolve(team);
      } else {
        reject(new Error("Team not found"));
      }
    });
  });
}

// getManager(managerId) -> resolve với manager object, reject nếu không tìm thấy
function getManager(managerId) {
  // TODO
  return new Promise((resolve, reject) => {
    delay(500).then(() => {
      const manager = db.managers.find((m) => m.id === managerId);
      if (manager) {
        resolve(manager);
      } else {
        reject(new Error("Manager not found"));
      }
    });
  });
}

// TODO: Dùng Promise chain để lấy thông tin manager của user id=1
getUser(1)
  .then((user) => getTeam(user.teamId))
  .then((team) => getManager(team.managerId))
  .then((manager) => console.log("Manager:", manager))
  .catch((err) => console.error(err.message));

// ============================================================
// Bài 3.3: Async/Await với error handling
// ============================================================

// TODO: Viết lại logic Bài 3.2 dùng async/await
// Thêm: nếu id <= 0, throw Error("Invalid user ID")
async function getUserManager(userId) {
  // TODO
  if (userId <= 0) {
    throw new Error("Invalid user ID");
  }
  try {
    const user = await getUser(userId);
    const team = await getTeam(user.teamId);
    const manager = await getManager(team.managerId);
    return manager;
  } catch (err) {
    throw err; // re-throw để bên ngoài catch
  }
}

// Test:
getUserManager(1).then((m) => console.log("Manager of user 1:", m.name));
getUserManager(-1).catch((e) => console.error(e.message)); // "Invalid user ID"
getUserManager(99).catch((e) => console.error(e.message)); // "User not found"

// ============================================================
// Bài 3.4: So sánh tuần tự vs song song
// ============================================================

// TODO: So sánh thời gian:
// a) Gọi getUser(1), getUser(2), getUser(3) tuần tự (await từng cái)
async function fetchSequential() {
  const start = Date.now();
  // TODO: await getUser(1), rồi getUser(2), rồi getUser(3) tuần tự
  try {
    await getUser(1);
    await getUser(2);
    await getUser(3);
  } catch (err) {
    throw err; // re-throw để bên ngoài catch
  }
  const elapsed = Date.now() - start;
  console.log(`Sequential: ${elapsed}ms`); // expect ~1500ms
}

// b) Gọi Promise.all([getUser(1), getUser(2), getUser(3)])
async function fetchParallel() {
  const start = Date.now();
  // TODO: Promise.all với 3 getUser calls
  try {
    await Promise.all([getUser(1), getUser(2), getUser(3)]);
  } catch (err) {
    throw err; // re-throw để bên ngoài catch
  }
  const elapsed = Date.now() - start;
  console.log(`Parallel: ${elapsed}ms`); // expect ~500ms
}

// Chạy cả 2 và so sánh:
fetchSequential().catch((err) => console.error(err.message));
fetchParallel().catch((err) => console.error(err.message));
