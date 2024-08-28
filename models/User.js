const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: [3, "Must be at least 3 characters long"],
      maxlength: [30, "Must be no more than 30 characters long"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: [8, "Must be at least 8 characters long"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", UserSchema);
