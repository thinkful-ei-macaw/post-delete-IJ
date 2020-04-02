const express = require("express");
const bookmarkRouter = express.Router();
const bodyParser = express.json();
const uuid = require("uuid/v4");
const logger = require("./logger");
const bookmarks = require("./store");
const BookmarksService = require("./bookmarks-service");

bookmarkRouter
  .route("/bookmarks")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks);
      })
      .catch(next);
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
  .get((req, res, next) => {
    const { id } = req.params;
    const knexInstance = req.app.get("db");
    BookmarksService.getById(knexInstance, id)
      .then(bookmark => {
        if (!bookmark) {
          console.log(bookmark);
          logger.error(`Bookmark with id ${id} not found.`);
          return res
            .status(404)
            .json({ error: { message: `bookmark doesn't exist` } });
        }
        res.json(bookmark);
      })
      .catch(next);
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
