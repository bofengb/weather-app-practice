const express = require("express");
const cors = require("cors");
const dotven = require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// Initialize express
const app = express();

// Enable JSON in ExpressJS
app.use(express.json());

// Initialize CORS
app.use(
  cors({
    credentials: true,
    // origin: "http://localhost:5173",
    origin: process.env.CORS_ORIGIN_URL,
  })
);

// Initialize cookie parser: allow the cookies to be going back from one host to another
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("DB connected"))
  .catch((error) => console.log(error));
// console.log(process.env.MONGODB_URL);

// All routes go to auth routes
app.use("/", require("./routes/authRoutes"));

// Define listener
const port = 4000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
