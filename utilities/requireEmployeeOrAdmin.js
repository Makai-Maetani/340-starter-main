function requireEmployeeOrAdmin(req, res, next) {
  const user = req.jwt;

  if (user && (user.type === "Employee" || user.type === "Admin")) {
    return next();
  }

  return res.status(403).render("partials/logBody", {
    title: "Sign In",
    errors: [{ msg: "Access restricted to employees or admins." }],
    data: {},
    success: null
  });
}

module.exports = requireEmployeeOrAdmin;
