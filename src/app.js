require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const winston = require("winston");
const uuid = require("uuid/v4");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

const bookmarks = [
  {
    id: "8sdfbvbs65sd",
    title: "Google",
    url: "http://google.com",
    desc: "An indie search engine startup",
    rating: "4"
  }
];
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;

  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: "Unauthorized request" });
  }
  // move to the next middleware
  next();
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "info.log" })]
});

if (NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}
app.get("/bookmarks", (req, res) => {
  res.json(bookmarks);
});
app.get("/bookmarks/:id", (req, res) => {
  const { id } = req.params;
  const bookmark = bookmarks.find(b => b.id == id);

  if (!bookmark) {
    logger.error(`Bookmark with id ${id} not found.`);
    return res.status(404).send("Card Not Found");
  }

  res.json(bookmark);
});

app.post("/bookmarks", (req, res) => {
  const { title, url, rating, desc = false } = req.body;
  const id = uuid()


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
  }
  bookmarks.push(newBookmark)
  res.send("got");
  
  
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;

// Write a route handler for the endpoint GET /bookmarks/:id that returns a single bookmark with the given ID, return 404 Not Found if the ID is not valid

// Write a route handler for the endpoint DELETE /bookmarks/:id that deletes the bookmark with the given ID.
