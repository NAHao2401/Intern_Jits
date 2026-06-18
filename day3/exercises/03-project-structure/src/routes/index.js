/**
 * Root router - mount tất cả sub-routers ở đây
 * app.js chỉ cần: app.use("/api", routes)
 */

const router = require("express").Router();
const todosRouter = require("./todos.routes");

router.use("/todos", todosRouter);

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

module.exports = router;
