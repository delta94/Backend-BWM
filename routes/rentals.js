var express = require("express");
var router = express.Router();
const authMiddleware = require("../middlewares/checkauth");
const rentalController = require("../controllers/rentals");

router.get("/secret", authMiddleware, rentalController.secret);

router.get("/manage", authMiddleware, rentalController.manage);

router.get("/:id/verify-user", authMiddleware, rentalController.idVerify);

router.get("/:id", rentalController.getById);

router.patch("/:id", authMiddleware, rentalController.updateById);

router.delete("/:id", authMiddleware, rentalController.deleteRentalById);

router.post("", authMiddleware, rentalController.createRental);

router.get("", rentalController.getAllRental);

module.exports = router;
