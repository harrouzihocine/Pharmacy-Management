const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const opts = {
  toJSON: {
    virtuals: true,
  },
};
//  This strategy integrates Mongoose with the passport-local strategy.
const passportLocalMongoose = require("passport-local-mongoose");
// Define the User schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    hash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
      default: "undefined",
    },
    role: {
      type: String,
      default: "user",
    },
    services: [
      {
        serviceName: {
          type: String,
          required: true, 
        },
        serviceABV: {
          type: String,
        },
      },
    ],

    loggedIn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
  opts
);

userSchema.plugin(passportLocalMongoose);

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (this.isModified("hash")) {
    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    this.salt = salt;
    this.hash = await bcrypt.hash(this.hash, salt);
  }
  next();
});

// comparer function
userSchema.methods.verifyPassword = function (password, hash) {
  return bcrypt.compareSync(password, hash);
};
// Create and export the User model
const User = mongoose.model("User", userSchema);
module.exports = User;
