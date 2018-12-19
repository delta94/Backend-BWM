var express = require("express");
var router = express.Router();
const Rental = require("../models/rental");
const FakeDb = require("../config/fake-db");

/* GET home page. */
router.get("/", function(req, res, next) {
  const fakeDb = new FakeDb();
  fakeDb.seeDB();
  res.render("index", { title: "Express" });
});

module.exports = router;
