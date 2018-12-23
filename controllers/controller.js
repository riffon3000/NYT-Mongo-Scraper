const express = require("express");
const router = express.Router();

// Scraping tools; Axios is a promised-based http library, similar to jQuery's Ajax method. It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

// Routes
router.get("/", function (req, res) {
    res.send(index.html);
});

// A GET route for scraping the invision blog
router.get("/scrape", function (req, res) {

    axios.get("https://www.nytimes.com").then(function (response) {

        let $ = cheerio.load(response.data);

        $(".title-link").each(function (i, element) {

            let title = $(element).children().text();
            let link = $(element).attr("href");
            let snippet = $(element).siblings('p').text().trim();
            let articleCreated = new Timestamp();

            let result = {
                title: title,
                link: link,
                snippet: snippet,
                articleCreated: articleCreated,
                isSaved: false
            }

            console.log(result);

            db.Article.findOne({ title: title }).then(function (data) {

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