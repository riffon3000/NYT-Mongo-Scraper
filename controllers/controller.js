const express = require("express");
const router = express.Router();

// Scraping tools; Axios is a promised-based http library, similar to jQuery's Ajax method. It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("../models");

// Routes
router.get("/", function (req, res) {
    Article.find({ saved: false }, function (error, found) {
        if (error) {
            console.log(error);
        } else if (found.length === 0) {
            res.render("empty")
        } else {

            var hbsObject = {
                articles: found
            };
            res.render("index", hbsObject);
        }
    });
});

// A GET route for scraping
router.get("/api/fetch", function (req, res) {

    axios.get("https://www.nytimes.com").then(function (response) {

        let $ = cheerio.load(response.data);

        $(".title-link").each(function (i, element) {

            let result = {};
            result.title = $(this.children().text();
            result.link = $(this).attr("href");
            result.snippet = $(element).siblings('p').text().trim();
            result.articleCreated = new Date();
            result.isSaved = false;

            console.log(result);

            db.Article.findOne({ title: result.title }).then(function (data) {

                console.log(data);

                if (data === null) {

                    db.Article.create(result).then(function (dbArticle) {
                        res.json(dbArticle);
                    });
                }
            }).catch(function (err) {
                res.json(err);
            });

        });

    });
});

// Route for getting all Articles from the db
router.get("/articles", function (req, res) {

    db.Article
        .find({})
        .sort({ articleCreated: -1 })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function (req, res) {

    db.Article
        .findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function (req, res) {

    db.Note
        .create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating article to be saved
router.put("/saved/:id", function (req, res) {

    db.Article
        .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: true } })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for getting saved article
router.get("/saved", function (req, res) {

    db.Article
        .find({ isSaved: true })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for deleting/updating saved article
router.put("/delete/:id", function (req, res) {

    db.Article
        .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: false } })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Export routes for server.js to use.
module.exports = router;