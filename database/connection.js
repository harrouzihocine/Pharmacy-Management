const mongoose = require("mongoose");
const User = require("../models/user");
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {});
// We now need to get notified if we connect successfully
//  or if a connection error occurs:
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async () => {
  const userExist = await User.findOne({
    username: process.env.ADMIN_USERNAME.toLowerCase(),
  });
  if (userExist) {
    console.log("user already exist");
    console.log("Database connected");
  } else {
    const user = new User({
      username: process.env.ADMIN_USERNAME.toLowerCase(),
      role: process.env.ADMIN_ROLE,
      hash: process.env.ADMIN_PASSWORD,
    });
    //  user.replaceOne.push("أدمين");
    await user.save().then((usr, err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Database connected");
        console.log("user created");
      }
    });
  }
});
