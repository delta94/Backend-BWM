var express = require("express");
var router = express.Router();
const userController = require("../controllers/user");
const authMiddleware = require("../middlewares/checkauth");

router.post("/auth", userController.auth);

router.post("/register", userController.register);

router.get("/:id", authMiddleware, userController.getUser);

router.put("", authMiddleware, userController.updateUser);

module.exports = router;
