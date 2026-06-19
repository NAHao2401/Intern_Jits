/**
 * Entry point: kết nối MongoDB rồi khởi động Express server
 *
 * Thứ tự bắt buộc:
 * 1. Kết nối database trước
 * 2. Sau khi connected mới start HTTP server
 * -> Tránh request đến trước khi DB sẵn sàng
 */

const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const app = require("./app");
const connectDB = require("./db/connect");

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
