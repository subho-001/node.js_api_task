const express = require("express");
const {
    registeredUser,
    loggedInUser,
    forgetPassword,
    resetPassword,
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registeredUser);
router.post("/login", loggedInUser);
router.post("/forget_password", forgetPassword);
router.post("/reset_password/:token", resetPassword);

module.exports = router;
