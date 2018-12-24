const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");

// Scraping tools; Axios is a promised-based http library, similar to jQuery's Ajax method. It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const Note = require("./models/Note");
const Article = require("./models/Article");

// Initialize Express
const app = express();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("/public"));

// Connect to the Mongo DB. If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

// Set Handlebars.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
const router = express.Router();

require("./config/routes")(router);
app.use(router);

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });