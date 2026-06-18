const { date } = require("joi");
const authService = require("../services/auth.service");

/**
 * TODO: Implement register controller
 * POST /api/auth/register
 * - Gọi authService.register(req.body)
 * - Response 201: { success: true, data: user }
 */
async function register(req, res, next) {
  try {
    // TODO: implement
    const user = await authService.register(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * TODO: Implement login controller
 * POST /api/auth/login
 * - Gọi authService.login(req.body)
 * - Response 200: { success: true, data: { token, expiresIn } }
 */
async function login(req, res, next) {
  try {
    // TODO: implement
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
