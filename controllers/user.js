const User = require("../models/user");
const bcrypt = require("bcrypt");
const { normalizeErrors } = require("../helpers/mongoose");
const jwt = require("jsonwebtoken");
const config = require("../config/dev");

module.exports.auth = (req, res, next) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return res.status(422).json({
      errors: [
        {
          title: "Data missing!",
          detail: "Provide email and password!"
        }
      ]
    });
  }

  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(422).json({
          errors: [
            {
              title: "Invalid User!",
              detail: "User does not exist"
            }
          ]
        });
      }

      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          const payload = {
            userId: user._id,
            username: user.username
          };

          jwt.sign(
            payload,
            config.SECRET,
            { expiresIn: "1h" },
            (err, token) => {
              const tokenBearer = "Bearer " + token;
              res.json(tokenBearer);
            }
          );
        } else {
          return res.status(422).json({
            errors: [
              {
                title: "Wrong Data!",
                detail: "Wrong email or password"
              }
            ]
          });
        }
      });
    })
    .catch(err => {
      res.status(422).json({
        errors: normalizeErrors(err.errors)
      });
    });
};

module.exports.register = (req, res, next) => {
  const { username, email, password, passowrdConfirmation } = req.body;

  if (!username || !email) {
    return res.status(422).json({
      errors: [
        {
          title: "Data missing!",
          detail: "Provide email and password!"
        }
      ]
    });
  }

  if (password !== passowrdConfirmation) {
    return res.status(422).json({
      errors: [
        {
          title: "Invalid password!",
          detail: "Password is not a same as confirmation!"
        }
      ]
    });
  }

  User.findOne({ email })
    .then(existingUser => {
      if (existingUser) {
        return res.status(422).json({
          errors: [
            {
              title: "Invalid email!",
              detail: "User with this email already exist!"
            }
          ]
        });
      }

      const user = new User({
        username,
        email,
        password
      });

      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) throw err;
          user.password = hash;

          user
            .save()
            .then(() => {
              res.json({
                registered: true
              });
            })
            .catch(err => {
              res.status(422).json({
                errors: normalizeErrors(err.errors)
              });
            });
        });
      });
    })
    .catch(err => {
      res.status(422).json({
        errors: normalizeErrors(err.errors)
      });
    });
};
