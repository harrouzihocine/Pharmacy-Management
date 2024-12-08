const User = require("../models/user");
const moment = require("moment");
// ===================================== Register Page (GET) =================================
module.exports.showRegisterForm = (req, res) => {
  res.render("register"); // Ensure you have a `register.ejs` file
};

// ===================================== POST Register Route =================================
module.exports.register = async (req, res) => {
  try {
    const { username, role, password } = req.body;
    const userExist = await User.findOne({ username: username.toLowerCase() });
    if (userExist) {
      req.flash("error", "user already exist");
      res.redirect("register");
    } else {
      const user = new User({
        username: username.toLowerCase(),
        role: role,
        hash: password,
      });

      await user.save().then((usr, err) => {
        if (err) {
          req.flash("error", err);
          res.redirect("register");
        } else {
          req.flash("success", "Bienvenu sur Pharmacie");
          res.redirect("/dashboard");
        }
      });
    }
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

// ========================================== Login Page (GET) =========================================
module.exports.showLoginForm = async (req, res) => {
  res.render("login"); // Render login.ejs with an error message if any
  // res.send("Welcome")
};

// ================================= Login POST (Authenticate User) =================================================
module.exports.login = async (req, res) => {
  req.flash("success", `Welcome Back ${req.user.firstname}`);
  // update the recently logged in user
  await User.findByIdAndUpdate(req.user.id, { loggedIn: moment() });
  const redirectUrl = req.session.returnTo || "/dashboard";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};
// ====================================== Logout Route (GET) =================================
module.exports.logout = (req, res) => {
  // logout requere a callback function and a get request to work
  req.logout(() => {
    req.flash("success", `Goodbye`);
    res.redirect("login");
  });
};
// ====================================== Dashboard Route (GET) =================================
module.exports.dashboard = (req, res) => {
  res.render("dashboard", { role: req.session.role }); // Send role to the view
};
