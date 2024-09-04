const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const posts = require("./routes/posts");
const users = require("./routes/users");
const comments = require("./routes/comments");

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// CORS Configuration
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// Health Check Route
app.get("/api/status", (req, res) => {
  res.send("Service is operational");
});

// Route Handlers
app.use("/api/posts", posts);
app.use("/api/users", users);
app.use("/api/comments", comments);

// MongoDB Connection and Server Start
const uri = `mongodb+srv://skz:admin@cluster0.c7xj5qh.mongodb.net/socialX?retryWrites=true&w=majority&appName=Cluster0`;

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

mongoose
  .connect(uri, clientOptions)
  .then(() => {
    // Start server only after successful MongoDB connection
    app.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  })
  .catch((err) => {
    console.log("ERROR: " + err);
  });
