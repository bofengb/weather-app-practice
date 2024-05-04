const mongoose = require("mongoose");

// Get mongoose schema
const { Schema } = mongoose;

// Define schema
const UserSchema = new Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});

// Define collection name and schema
const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
