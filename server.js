// --- expoer secret data in order to read by script
require("dotenv").config();

// --- export express package and others (MongoDB connector, book Router)
const express = require("express");
const connectToDB = require("./database/db.js");
const authRoutes = require("./routes/auth-routes.js");
const homeRoutes = require("./routes/home-routes.js");
const adminRoutes = require("./routes/admin-routes.js");
const uploadImageRoutes = require("./routes/image-routes.js");

//-----------------------
const app = express();

//--- middleware to parse json data
app.use(express.json());

//------routes-----------------
// localhost/api/auth/
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/image", uploadImageRoutes);

// --- port = 4001
const PORT = process.env.PORT || 3000;

//----------------------
//----connect to DB--run server---

app.listen(PORT, () => {
  connectToDB();
  console.log(`Server is workib=ng on port ${PORT}`);
});
