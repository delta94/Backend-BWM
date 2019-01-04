var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

const rentalRouter = require("./routes/rentals");
const userRouter = require("./routes/user");
const bookingRouter = require("./routes/booking");
const imageUploadRouter = require("./routes/image-upload");
const paymentRouter = require("./routes/payments");
const authRouter = require("./routes/auth");

const config = require("./config");
const passport = require("passport");
const passportGoogle = require("./config/passport");

//DB mongodb
const mongoose = require("mongoose");
mongoose
  .connect(
    config.DB_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Connected DB");
  })
  .catch(() => {
    console.log("Connect Faild");
  });

var app = express();

app.use(
  session({
    secret: config.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/v1", imageUploadRouter);

app.use("/api/v1/rentals", rentalRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/auth", authRouter);

if (process.env.NODE_ENV === "production") {
  const appPath = path.join(__dirname, "dist");
  app.use(express.static(appPath));

  app.get("*", function(req, res) {
    res.sendFile(path.resolve(appPath, "index.html"));
  });
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
