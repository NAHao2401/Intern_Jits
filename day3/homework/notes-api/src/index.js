/**
 * Homework - Notes API
 * Day 3 - Validation, Authentication & Project Structure
 *
 * Chạy: node src/index.js
 * Setup: tạo .env với JWT_SECRET=notes-api-secret và JWT_EXPIRES_IN=1h
 */

const app = require("./app");
const { seedAdmin } = require("./data/store");
const PORT = process.env.PORT || 3005;

async function startServer() {
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`\nNotes API running on http://localhost:${PORT}`);
    console.log("\n--- Test flow ---");
    console.log("\n# 1. Đăng ký user:");
    console.log(`curl -X POST http://localhost:${PORT}/api/auth/register \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"name":"Alice","email":"alice@example.com","password":"Secret123"}'`);
    console.log("\n# 2. Login (lưu token):");
    console.log(`curl -X POST http://localhost:${PORT}/api/auth/login \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"email":"alice@example.com","password":"Secret123"}'`);
    console.log("\n# 3. Tạo note (thay <token>):");
    console.log(`curl -X POST http://localhost:${PORT}/api/notes \\`);
    console.log(`  -H "Authorization: Bearer <token>" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"title":"My first note","content":"Hello world","tags":["personal"]}'`);
    console.log("\n# 4. Lấy notes của mình:");
    console.log(`curl http://localhost:${PORT}/api/notes -H "Authorization: Bearer <token>"`);
    console.log("\n# 5. Filter theo tag:");
    console.log(`curl "http://localhost:${PORT}/api/notes?tag=personal" -H "Authorization: Bearer <token>"`);
    console.log("\n# 6. Search:");
    console.log(`curl "http://localhost:${PORT}/api/notes?q=hello" -H "Authorization: Bearer <token>"`);
    console.log("\n# 7. Login admin rồi xem tất cả notes:");
    console.log(`curl -X POST http://localhost:${PORT}/api/auth/login \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"email":"admin@example.com","password":"Admin@123"}'`);
    console.log(`curl http://localhost:${PORT}/api/admin/notes -H "Authorization: Bearer <admin_token>"`);
    console.log("\n# 8. User thường cố xem admin route (expect 403):");
    console.log(`curl http://localhost:${PORT}/api/admin/notes -H "Authorization: Bearer <user_token>"`);
    console.log("\n# 9. Xem note của người khác (expect 403):");
    console.log(`# Đăng ký user thứ 2, tạo note, rồi dùng token của Alice để GET note đó`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
