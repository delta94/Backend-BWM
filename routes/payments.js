var express = require("express");
var router = express.Router();
const authMiddleware = require("../middlewares/checkauth");

const paymentController = require("../controllers/payment");

router.get("", authMiddleware, paymentController.getPendingPayments);

router.post("/accept", authMiddleware, paymentController.confirmPayment);

router.post("/decline", authMiddleware, paymentController.declinePayment);

module.exports = router;
