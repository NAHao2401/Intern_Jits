/**
 * Entry point - chỉ start server
 * Không có Express config ở đây -> dễ test app.js riêng
 *
 * Chạy: node src/index.js
 */

const app = require("./app");
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`\nTodo API (layered) running on http://localhost:${PORT}`);
  console.log("\n--- Test commands ---");
  console.log(`\n# Health check:`);
  console.log(`curl http://localhost:${PORT}/api/health`);
  console.log(`\n# Tạo todos:`);
  console.log(`curl -X POST http://localhost:${PORT}/api/todos \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"title":"Học Project Structure","priority":"high"}'`);
  console.log(`\ncurl -X POST http://localhost:${PORT}/api/todos \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"title":"Refactor Day 2 code"}'`);
  console.log(`\n# List todos:`);
  console.log(`curl http://localhost:${PORT}/api/todos`);
  console.log(`curl "http://localhost:${PORT}/api/todos?status=active&sort=priority"`);
  console.log(`\n# Toggle complete:`);
  console.log(`curl -X PATCH http://localhost:${PORT}/api/todos/1/complete`);
  console.log(`\n# Update:`);
  console.log(`curl -X PATCH http://localhost:${PORT}/api/todos/1 \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"title":"Updated title","priority":"low"}'`);
  console.log(`\n# Delete:`);
  console.log(`curl -X DELETE http://localhost:${PORT}/api/todos/1`);
  console.log(`\n# Test validation:`);
  console.log(`curl -X POST http://localhost:${PORT}/api/todos \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{}'`);
  console.log(`\n# Test 404:`);
  console.log(`curl http://localhost:${PORT}/api/todos/999`);
});
