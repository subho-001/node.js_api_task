const express = require("express");
const { registeredUser, loggedInUser, forgetPassword } = require("../controllers/userController");
const router = express.Router();

router.post('/register', registeredUser);
router.post('/login', loggedInUser);
router.post('/forget_password', forgetPassword);

module.exports = router