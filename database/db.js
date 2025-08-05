const mongoose = require("mongoose");
// --- expoer secret data in order to read by script
require("dotenv").config();

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MOGODB_URI);
    console.log("mongodb is connected successfully !");
  } catch (error) {
    console.error("Mongodb connection failed", error);
    process.exit(1);
  }
};

module.exports = connectToDB;
