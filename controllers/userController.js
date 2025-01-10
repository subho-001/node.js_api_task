const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// User Registration
const registeredUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: true, message: "All fields are required" });
        }

        const isUserExist = await UserModel.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ error: true, message: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await UserModel.create({ username, email, password: hashedPassword });
        return res.status(201).json({ error: false, message: "User registered successfully", user });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Something went wrong. Please try again." });
    }
};

// User Login
const loggedInUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: true, message: "All fields are required" });
        }

        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: true, message: "User does not exist with this username" });
        }

        const isMatchingPassword = await bcrypt.compare(password, user.password);
        if (!isMatchingPassword) {
            return res.status(400).json({ error: true, message: "Password is incorrect" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        return res.status(200).json({ error: false, message: "User logged in successfully", token });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Something went wrong. Please try again." });
    }
};

// Forgot Password
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: true, message: "Email is required" });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15m" });

        const mailOption = {
            from: process.env.EMAIL_ID,
            to: user.email,
            subject: "Reset Password",
            text: `Click the link to reset your password: http://localhost:${process.env.PORT}/reset_password/${resetToken}`,
        };

        await transporter.sendMail(mailOption);
        return res.status(200).json({ error: false, message: "Password reset email sent" });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Something went wrong. Please try again." });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: true, message: "New password is required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ error: false, message: "Password reset successful" });
    } catch (error) {
        return res.status(400).json({ error: true, message: "Invalid or expired token" });
    }
};

module.exports = { registeredUser, loggedInUser, forgetPassword, resetPassword };
