var express = require("express");
var router = express.Router();
const authMiddleware = require("../middlewares/checkauth");
const bookingController = require("../controllers/booking");

router.post("", authMiddleware, bookingController.createBooking);

router.get("/manage", authMiddleware, bookingController.getUserBookings);

module.exports = router;
