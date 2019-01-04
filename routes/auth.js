var express = require("express");
var router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../config");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/"
  }),
  (req, res, next) => {
    const user = req.user;

    const payload = {
      userId: user._id,
      username: user.username
    };

    jwt.sign(payload, config.SECRET, { expiresIn: "1h" }, (err, token) => {
      const tokenAuth = "Bearer " + token;
      res.redirect("/login?loginGoogle=" + tokenAuth);
    });
  }
);

module.exports = router;
