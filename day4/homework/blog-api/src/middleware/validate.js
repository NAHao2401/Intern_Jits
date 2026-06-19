/**
 * Joi validation middleware factory
 * Tái sử dụng từ Day 3
 */

/**
 * @param {import("joi").Schema} schema - Joi schema để validate
 * @param {"body" | "query" | "params"} source - Phần của request cần validate
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,   // trả về tất cả lỗi, không dừng ở lỗi đầu
      stripUnknown: true,  // bỏ field không khai báo trong schema
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      }));
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    req[source] = value; // gán lại data đã sanitize
    next();
  };
}

module.exports = validate;
