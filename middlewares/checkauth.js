const config = require("../config/dev");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { normalizeErrors } = require("../helpers/mongoose");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const tokenSplit = token.split(" ")[1];

    const decodedToken = jwt.verify(tokenSplit, config.SECRET);

    User.findById(decodedToken.userId)
      .then(user => {
        if (user) {
          req.userProfile = user;
          next();
        } else {
          return res.status(401).json({
            errors: [
              {
                title: "Not authorized",
                detail: "You need to login to get access!"
              }
            ]
          });
        }
      })
      .catch(err => {
        res.status(422).json({
          errors: normalizeErrors(err.errors)
        });
      });
  } catch (error) {
    return res.status(401).json({
      errors: [
        {
          title: "Not authorized",
          detail: "You need to login to get access!"
        }
      ]
    });
  }
};
