// Scraping tools; Axios is a promised-based http library, similar to jQuery"s Ajax method. It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

//scrape articles from the New YorK Times
const scrape = function (callback) {

    const articlesArr = [];

    axios.get("https://www.nytimes.com").then(function (response) {

        const $ = cheerio.load(response.data);


        $("h2.story-heading").each(function (i, element) {

            const result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");
            result.snippet = $(this).siblings("p").text().trim();
            result.articleCreated = new Date();
            result.isSaved = false;

            if (result.title !== "" && result.link !== "") {
                articlesArr.push(result);
            }
            // Send a message to the client
            res.send("Scrape Complete");
        });
        callback(articlesArr);
    });

};

module.exports = scrape;