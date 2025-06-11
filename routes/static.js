// routes/static.js
const express = require("express");
const router = express.Router();

// Static routes
router.get("/about", (req, res) => {
  res.render("about", { title: "About Us" });
});

router.get("/account", (req, res) => {
  res.render("partials/logBody", { title: "Sign In" });
});

router.get("/signup", (req, res) => {
  res.render("partials/signupBody", { title: "Sign Up" });
});

router.get("/testError", (req, res) => {
  throw new Error("This is a test 500 error.");
});

module.exports = router;