const express = require("express");
const bookmarkRouter = express.Router();
const bodyParser = express.json();
const uuid = require("uuid/v4");
const logger = require("./logger");
const bookmarks = require("./store");
const BookmarksService = require("./bookmarks-service");

bookmarkRouter.route("/bookmarks").get((req, res, next) => {
  const knexInstance = req.app.get("db");
  BookmarksService.getAllBookmarks(knexInstance)
    .then(bookmarks => {
      res.json(bookmarks);
    })
    .catch(next);
})
.post(bodyParser, (req, res, next) => {
const { title, url, rating } = req.bodyParser;
 const newBookmark = { title, url, rating };
 BookmarksService.insertBookmarks(req.app.get("db"), newBookmark)
   .then(bookmark => {
     res.status(201).json(bookmark);
   })
   .catch(next);
});

bookmarkRouter
  .route("/bookmarks/:id")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    const { id } = req.params;
    BookmarksService.getById(knexInstance, id)
      .then(bookmark => {
        if (!bookmark) {
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
