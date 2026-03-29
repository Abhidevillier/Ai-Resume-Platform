const { validationResult } = require("express-validator");

/**
 * Runs after express-validator chains.
 * If there are errors, returns 400 with the first error message per field.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().reduce((acc, err) => {
      if (!acc[err.path]) acc[err.path] = err.msg;
      return acc;
    }, {});
    return res.status(400).json({ success: false, message: "Validation failed", errors: formatted });
  }
  next();
};

module.exports = validate;
