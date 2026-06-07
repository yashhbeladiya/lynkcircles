// Validation middleware factory backed by Zod. Replaces ad-hoc
// `if (!field) return 400` chains scattered through controllers
// with a single boundary check that returns a structured error.
//
//   router.post("/login", validate(loginSchema), login)
//
// On success, parsed data lands on `req.body` (coerced + stripped
// of unknown keys), so controllers can trust their inputs.

export const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request",
      errors: result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }
  req[source] = result.data;
  next();
};
