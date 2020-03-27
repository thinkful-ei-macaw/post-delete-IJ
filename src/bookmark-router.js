const express = require("express");
const bookmarkRouter = express.Router();
const bodyParser = express.json();
const uuid = require("uuid/v4");
const logger = require("./logger");
const bookmarks = require("./store");

bookmarkRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, url, rating, desc = false } = req.body;
    const id = uuid();

    if (!title) {
      logger.error(`Title is required`);
      return res.status(400).send("Invalid data");
    }
    const regex = /^[1-5]$/;
    if (!rating || !rating.match(regex)) {
      logger.error("rating is required and must be a number 1-5");
      return res.status(400).send("invalid data");
    }
    if (!url) {
      logger.error("url is required");
      return res.status(400).send("invalid data");
    }
    const newBookmark = {
      id,
      title,
      rating,
      url,
      desc
    };
    bookmarks.push(newBookmark);
    res.send("got");
  });

bookmarkRouter
  .route("/bookmarks/:id")
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(b => b.id == id);

    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send("Bookmark not found");
    }

    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const index = bookmarks.findIndex(i => i.id == id);

    if (index === -1) {
      logger.error(`List with id ${id} not found.`);
      return res.status(404).send("Not Found");
    }

    bookmarks.splice(index, 1);

    logger.info(`Bookmark with id ${id} deleted.`);
    res.status(204).end();
  });

module.exports = bookmarkRouter;
