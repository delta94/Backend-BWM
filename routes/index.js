var express = require("express");
var router = express.Router();
const FakeDb = require("../fake-db");

/* GET home page. */
router.get("/", function(req, res, next) {
  // const fakeDb = new FakeDb();
  // fakeDb.seedDb();
  res.render("index", { title: "Express" });
});

module.exports = router;
