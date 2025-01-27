const User = require("../models/user");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const services = [
  { _id: 'PCS', name: 'Pharmacie centrale' },
  { _id: 'APP', name: 'Approvisionnement' },
  { _id: 'CON', name: 'Consultations' },
  { _id: 'RAD', name: 'Radiologie' },
  { _id: 'LAM', name: "Laboratoire d'analyse médicale" },
  { _id: 'LAP', name: "Laboratoire d'anatomie-pathologique" },
  { _id: 'HMU', name: 'Hospitalisation multidisciplinaire' },
  { _id: 'HCA', name: 'Hospitalisation de cardiologie' },
  { _id: 'URG', name: 'Urgences médicales' },
  { _id: 'BOP', name: 'Blocs opératoires' },
  { _id: 'CAT', name: 'Cathétérisme' },
  { _id: 'REA', name: 'Réanimation' },
  { _id: 'MIN', name: 'Médecine Interne' },
  { _id: 'MPR', name: 'Médecine physique et réadaptation' },
  { _id: 'DAF', name: 'Direction administrative et finance' },
];
// ===================================== Register Page (GET) =================================
module.exports.showRegisterForm = (req, res) => {
  res.render("register",{services}); // Ensure you have a `register.ejs` file
};

// ===================================== POST Register Route =================================
module.exports.register = async (req, res) => {
  try {
    const { username, role, password, services: selectedServices } = req.body;

    // Check if the user already exists
    const userExist = await User.findOne({ username: username.toLowerCase() });
    if (userExist) {
      req.flash("error", "User already exists");
      return res.redirect("register");
    }

    // Map the selected services to the correct format for the schema
    const formattedServices = Array.isArray(selectedServices)
      ? selectedServices.map(serviceABV => {
          const service = services.find(s => s._id === serviceABV);
          return service ? { serviceName: service.name, serviceABV: service._id } : null;
        }).filter(Boolean) // Filter out null values if the serviceABV is not found
      : [];

    // Create a new user
    const user = new User({
      username: username.toLowerCase(),
      role,
      hash: password, // Ensure password is hashed securely (e.g., bcrypt)
      services: formattedServices,
    });

    // Save the user
    await user.save()
      .then(() => {
        const stats = {
          totalMedicines: 120,
          outOfStock: 5,
          pendingOrders: 8,
         
        };
        req.flash("success", "Bienvenue sur Pharmacie");
        res.render("dashboard", { role: req.session.role,stats:stats });
      })
      .catch(err => {
        req.flash("error", err.message);
        res.redirect("register");
      });

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
  req.flash("success", `Welcome Back ${req.user.username}`);
  // update the recently logged in user
  await User.findByIdAndUpdate(req.user.id, { loggedIn: moment() });
  const redirectUrl = req.session.returnTo || "/";
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
  const stats = {
    totalMedicines: 120,
    outOfStock: 5,
    pendingOrders: 8,
   
  };

  res.render("dashboard", { role: req.session.role,stats:stats }); // Send role to the view
};
// ===================================== Register Page (GET) =================================
module.exports.getProfile = async(req, res) => {
  const user = await User.findById(req.user._id);
  res.render("User/profile",{user,services}); // Ensure you have a `register.ejs` file
};




exports.updateProfile = async (req, res, next) => {
  try {
    const { username, password, role, services } = req.body;

    let updateData = { username, role };

    // Check if the password is provided
    if (password) {
      // Generate salt and hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.hash = hashedPassword;  // Save the hashed password
      updateData.salt = salt; // Save the salt
    }

    // If services are provided, format them into an array of objects
    if (Array.isArray(services)) {
      updateData.services = services.map(service => ({
        serviceName: service,
        serviceABV: service,
      }));
    }

    // Update the user by ID
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    req.logout(() => {
      req.flash("success", `Goodbye`);
      res.redirect("login");
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    next(error); // Pass errors to the error handler middleware
  }
};