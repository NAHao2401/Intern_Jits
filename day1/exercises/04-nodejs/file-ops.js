/**
 * Bài 4.3: Node.js Built-in Modules
 * Sử dụng fs và path
 */

const fs = require("fs");
const path = require("path");

// ============================================================
// Task 1: Đọc file hiện tại và log số dòng
// ============================================================

// TODO: Đọc file này (file-ops.js) và log ra số dòng
// Dùng fs.readFileSync() hoặc fs.promises.readFile()
// Gợi ý: content.split("\n").length
const content = fs.readFileSync(__filename, "utf-8");
const lineCount = content.split("\n").length;
console.log(`Number of lines in ${path.basename(__filename)}:`, lineCount);

// ============================================================
// Task 2: Tạo file output.txt chứa timestamp
// ============================================================

// TODO: Tạo file output.txt trong cùng thư mục
// Nội dung: "Generated at: <timestamp hiện tại>"
// Dùng path.join(__dirname, "output.txt") để tạo đường dẫn
const outputPath = path.join(__dirname, "output.txt");
const timestamp = new Date().toISOString();
const outputContent = `Generated at: ${timestamp}`;
fs.writeFileSync(outputPath, outputContent);
console.log(`Created file ${outputPath} with content:\n${outputContent}`);
// ============================================================
// Task 3: Dùng path module
// ============================================================

// TODO: Log ra các thông tin sau về file hiện tại:
// - Tên file: path.basename(__filename)
// - Extension: path.extname(__filename)
// - Thư mục chứa file: path.dirname(__filename)
// - Đường dẫn join ví dụ: path.join(__dirname, "..", "plan.md")

console.log("=== Path info ===");
// TODO: log các thông tin path
console.log("File name:", path.basename(__filename));
console.log("File extension:", path.extname(__filename));
console.log("Directory name:", path.dirname(__filename));
console.log("Joined path example:", path.join(__dirname, "..", "plan.md"));

console.log("\n=== File operations ===");
// TODO: đọc file và tạo output.txt
const fileContent = fs.readFileSync(__filename, "utf-8");
const outputFilePath = path.join(__dirname, "output.txt");
fs.writeFileSync(outputFilePath, `Generated at: ${new Date().toISOString()}`);
console.log(`Created file ${outputFilePath} with timestamp.`);
