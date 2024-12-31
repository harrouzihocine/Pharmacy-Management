
// Middleware to check if the user is logged in
module.exports.isLoggedIn = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  } 
  next();
};
  
module.exports.isAdmin = async (req, res, next) => {
  if (req.user.role != "Admin") {
    console.log("req.user.role:", req.user.role);
    req.flash("error", "Vous n'êtes pas autorisé!");
    return res.redirect(`back`);
  }
  next();
};
module.exports.isPharmacienPrincipal = async (req, res, next) => {
  if (req.user.role != "Pharmacien Principal" && req.user.role != "Admin") {
    console.log("req.user.role:", req.user.role);
    req.flash("error", "Vous n'êtes pas autorisé!");
    return res.redirect(`back`);
  }
  next();
};
module.exports.isAchteur = async (req, res, next) => {
  if (req.user.role != "Achteur" && req.user.role != "Admin" && req.user.role != "Pharmacien Principal" ) {
    console.log("req.user.role:", req.user.role);
    req.flash("error", "Vous n'êtes pas autorisé!");
    return res.redirect(`back`);
  }
  next();
};
module.exports.isResponsableService = async (req, res, next) => {
  if (req.user.role != "Responsable Service" && req.user.role != "Admin" && req.user.role != "Pharmacien Principal" ) {
    console.log("req.user.role:", req.user.role);
    req.flash("error", "Vous n'êtes pas autorisé!");
    return res.redirect(`back`);
  }
  next();
};
  