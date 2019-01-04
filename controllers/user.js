const User = require("../models/user");
const bcrypt = require("bcrypt");
const { normalizeErrors } = require("../helpers/mongoose");
const jwt = require("jsonwebtoken");
const config = require("../config");

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hyeieisi@gmail.com",
    pass: "Ngocdat21"
  }
});

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
  const { username, email, password, passwordConfirmation } = req.body;

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

  if (password !== passwordConfirmation) {
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

      let mailOptions = {
        from: "hyeieisi@gmail.com",
        to: email,
        subject: "Thanks for registering my web",
        html: `<h1>Welcome !</h1><br><p>You have successfully registered your account: ${email} and password: ${password}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      const user = new User({
        username,
        email,
        password,
        avatar: `http://api.adorable.io/avatars/250/${username}.png`
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

module.exports.getUser = function(req, res) {
  const requestedUserId = req.params.id;
  const user = req.userProfile;

  if (requestedUserId === user.id) {
    User.findById(requestedUserId, function(err, foundUser) {
      if (err) {
        return res.status(422).send({ errors: normalizeErrors(err.errors) });
      }

      return res.json(foundUser);
    });
  } else {
    User.findById(requestedUserId)
      .select("-revenue -stripeCustomerId -password")
      .exec(function(err, foundUser) {
        if (err) {
          return res.status(422).send({ errors: normalizeErrors(err.errors) });
        }

        return res.json(foundUser);
      });
  }
};

module.exports.updateUser = (req, res) => {
  const user = req.userProfile;
  const userData = req.body;

  User.findByIdAndUpdate({ _id: user._id }, { $set: userData }, { new: true })
    .then(foundUser => {
      res.json(foundUser);
    })
    .catch(err =>
      res.status(422).send({ errors: normalizeErrors(err.errors) })
    );
};
