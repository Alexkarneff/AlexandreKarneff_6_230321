const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// connexion BDD, le string est passé en variable env
mongoose
  .connect(
    process.env.MONGO,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
