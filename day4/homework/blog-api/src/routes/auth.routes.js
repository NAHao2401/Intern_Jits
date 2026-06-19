/**
 * Auth Routes
 *
 * POST /api/auth/register  — đăng ký tài khoản
 * POST /api/auth/login     — đăng nhập, nhận JWT token
 */

const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");

router.post("/register", validate(registerSchema), authController.register);
router.post("/login",    validate(loginSchema),    authController.login);

module.exports = router;
