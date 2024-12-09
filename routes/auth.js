const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const {
  dashboard,
  login,
  logout,
  register,
  showLoginForm,
  showRegisterForm,
} = require("../controller/auth");
const catchAsync = require("../utils/catchAsync");

// Register routes
router
  .route("/register")
  .get(catchAsync(showRegisterForm))
  .post(catchAsync(register));
// Login routes
router
  .route("/login")
  .get(catchAsync(showLoginForm))
  .post(
    passport.authenticate("user", {
      failureFlash: true,
      failureRedirect: "/login",
      failureMessage: true,
    }),
    login
  );
// Logout route
router.route("/logout").get(logout);

// Dashboard route
router.route("/").get(dashboard);

module.exports = router;
