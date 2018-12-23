// Scraping tools; Axios is a promised-based http library, similar to jQuery's Ajax method. It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

//scrape articles from the New YorK Times
let scrape = function (callback) {

    let articlesArr = [];

    axios.get("https://www.nytimes.com").then(function (response) {

        let $ = cheerio.load(response.data);


        $("h2.story-heading").each(function (i, element) {

            let result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children().text();
            result.link = $(this).attr("href");
            result.snippet = $(this).siblings('p').text().trim();
            result.articleCreated = new Date();
            result.isSaved = false;

            if (result.title !== "" && result.link !== "") {
                articlesArr.push(result);
            }
        });
        callback(articlesArr);
    });

};

module.exports = scrape;