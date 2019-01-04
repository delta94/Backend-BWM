const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const config = require("./index");

const User = require("../models/user");

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hyeieisi@gmail.com",
    pass: "Ngocdat21"
  }
});

// ma hoa thong tin user bang id
passport.serializeUser((user, done) => {
  done(null, user.email);
});

// giai ma thong tin user qua id
passport.deserializeUser((email, done) => {
  User.findOne({ email })
    .then(user => done(null, user))
    .catch(err => done(null, false));
});

passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/auth/google/redirect",
      clientID: config.GOOGLE.CLIENTID,
      clientSecret: config.GOOGLE.CLIENTSECRET,
      profileFields: ["email", "gender", "locale", "displayName"]
    },
    (accessToken, refreshToken, profile, done) => {
      let getValue = profile._json;
      const email = getValue.emails[0].value;
      const name = getValue.displayName;
      const imageURL = getValue.image.url.split("?");
      const avatar = imageURL[0] + `?sz=250`;
      User.findOne({ email: email })
        .then(currentUser => {
          if (currentUser) {
            done(null, currentUser);
          } else {
            let mailOptions = {
              from: "hyeieisi@gmail.com",
              to: email,
              subject: "Thanks for registering my web",
              html: `<h1>Welcome !</h1><br><p>You have successfully registered your account: ${email}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
              } else {
                console.log("Email sent: " + info.response);
              }
            });

            const user = new User({
              username: name,
              email: email,
              avatar: avatar
            });

            user.save((err, user) => {
              if (err) {
                done(null, false);
              } else {
                done(null, user);
              }
            });
          }
        })
        .catch(err => console.log(err));
    }
  )
);
