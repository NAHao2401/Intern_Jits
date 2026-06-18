/**
 * TODO: Copy validate middleware từ bài 1 (hoặc viết lại)
 *
 * validate(schema, source = "body") -> middleware
 * - Validate req[source]
 * - Lỗi -> 400 với details
 * - OK -> req[source] = sanitized; next()
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    // TODO: implement
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      }));
      return res
        .status(400)
        .json({ success: false, error: "Validation failed", details });
    }
    req[source] = value;
    next();
  };
}

module.exports = validate;
