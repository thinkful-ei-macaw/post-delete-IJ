const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeBookmarksArray } = require("./bookmarks.fixtures");

describe.only("Bookmarks Endpoints", function() {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => db("bookmarks").truncate());

  afterEach("cleanup", () => db("bookmarks").truncate());

  describe(`GET /bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/bookmarks")
          .expect(200, []);
      });
    });

    context("Given there are bookmarks in the database", () => {
      const testbookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testbookmarks);
      });

      it("responds with 200 and all of the bookmarks", () => {
        return supertest(app)
          .get("/bookmarks")
          .expect(200, testbookmarks);
      });
    });
  });

  describe.only(`POST /bookmarks`, () => {
    it(`creates an bookmark, responding with 201 and the new bookmark`, function() {
      const newBookmark = {
        title: "Test new bookmark",
        url: "url",
        rating: "4"
      };

      return supertest(app)
        .post("/bookmarks")
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title);
          expect(res.body.url).to.eql(newBookmark.url);
          expect(res.body.rating).to.eql(newBookmark.rating);
          expect(res.body).to.have.property("id");
        })
        .then(postRes =>
          supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });
  });

  describe(`GET /bookmarks/:bookmark_id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(404, { error: { message: `bookmark doesn't exist` } });
      });
    });

    context("Given there are bookmarks in the database", () => {
      const testbookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testbookmarks);
      });

      it("responds with 200 and the specified bookmark", () => {
        const bookmarkId = 2;
        const expectedbookmark = testbookmarks[bookmarkId - 1];
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(200, expectedbookmark);
      });
    });
  });
});
