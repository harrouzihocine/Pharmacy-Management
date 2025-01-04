if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
// const bodyParser = require('body-parser');
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");
let ejs = require("ejs");
const ejsMate = require("ejs-mate");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
// Passport is Express-compatible authentication middleware for Node.js */
const passport = require("passport");
// Passport uses the concept of strategies to authenticate requests
// passport-local is an authentication strategy.
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const DBConnection = require("./database/connection");
const { sessionConfig } = require("./config/sessionConfig");
// the local file contain all the local variable
const { locals } = require("./config/local");
const User = require("./models/user");

const app = express();

// Set up middleware
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use('/public', express.static(path.join(__dirname, 'node_modules/mdb-ui-kit/dist')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(mongoSanitize({ replaceWith: "_" }));
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  "user",
  new LocalStrategy(async (username, password, done) => {
    await User.findOne({ username: username.toLowerCase() })
      .select("+salt +hash")
      .then((user, err) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, "Verifer username ou le mot de passe");
        } else {
          if (user.verifyPassword(password, user.hash)) {
            return done(null, user);
          } else {
            return done(
              null,
              false,
              "Mot de passe incorrect, verifier votre mot de passe"
            );
          }
        }
      });
  })
);

// serialization refers to how to store user's
// authentication user data will be stored in the session
passport.serializeUser((user, done) => {
  passport.serializeUser(User.serializeUser());
  done(null, user);
});

// deserialization refers to how remove user's authentication data
passport.deserializeUser((user, done) => {
  passport.deserializeUser(User.deserializeUser());
  done(null, user);
});
app.use(locals);
// Import Routes
const authRoutes = require("./routes/auth"); // Import authentication routes
app.use("/", authRoutes); // Use authentication routes for login
const locationRoutes = require("./routes/location"); 
app.use("/location", locationRoutes); 

const medicamentRoutes = require("./routes/medicament"); 
app.use("/medicament", medicamentRoutes); 

const pharmacyRoutes = require("./routes/pharmacy"); 
app.use("/pharmacy", pharmacyRoutes); 

const storageRoutes = require("./routes/storage"); 
app.use("/storage", storageRoutes); 

const inStockRoutes = require("./routes/inStock"); 
app.use("/inStock", inStockRoutes); 

const inDemandRoutes = require("./routes/demand"); 
app.use("/demand", inDemandRoutes); 

const inInventoryRoutes = require("./routes/inventory"); 
app.use("/inventory", inInventoryRoutes); 

const fournisseurRoutes = require("./routes/fournisseur"); 
app.use("/fournisseur",fournisseurRoutes);
 
const prescriptionRoutes = require("./routes/prescription"); 
app.use("/prescription",prescriptionRoutes); 

const patientRoutes = require("./routes/patient"); 
app.use("/patient",patientRoutes); 

const port = process.env.PORT;

app.listen(port, "0.0.0.0", () => {
  console.log("===================================================");
  console.log(`   ----- SERVER IS RUNNING ON PORT ${port} ----`);
  console.log("===================================================");
});
