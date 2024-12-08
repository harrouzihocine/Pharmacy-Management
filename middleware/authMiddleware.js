// middleware/authMiddleware.js

// Middleware to check if the user is logged in
function isLoggedIn(req, res, next) {
    console.log("User role login:", req.session.role);
    if (!req.session.userId) {
      return res.redirect('/login'); // Redirect to login if not logged in
    }
    next(); // Proceed to the next middleware or route handler
  }
  
  // Middleware to check if the user is an admin
  function isAdmin(req, res, next) {
    console.log("User role ad:", req.session.role);
    if (req.session.role !== 'admin') {
      return res.redirect('/permission-denied'); // Redirect to permission denied page
    }
    next(); // Proceed if admin
  }
  
  // Middleware to check if the user is a technician
  function isTechnician(req, res, next) {
    console.log("User role tech:", req.session.role);
    if (req.session.role !== 'technician') {
      return res.redirect('/permission-denied'); // Redirect to permission denied page
    }
    next(); // Proceed if technician
  }
  
  module.exports = { isLoggedIn, isAdmin, isTechnician };
  