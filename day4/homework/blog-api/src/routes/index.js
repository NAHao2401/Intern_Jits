/**
 * Root router — mount tất cả sub-routers
 */

const router = require("express").Router();

router.use("/auth",     require("./auth.routes"));
router.use("/posts",    require("./posts.routes"));
router.use("/comments", require("./comments.routes"));

module.exports = router;
