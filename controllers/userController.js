const UserModel = require("../models/userModel");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const registeredUser = async(req, res)=>{
    try {
        const {username, email, password} = req.body;
        const isUserExist = await UserModel.findOne({email})
        if(isUserExist) {
            return res.status(400).json({message:"User is already exist with this email id"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt)
        const user = await UserModel.create({username, email, password:hashedPassword});
        return res.status(200).json({error:false, message:"User registered successfully", user})
    } catch(error) {
        return res.status(400).json({error:true, message:error.message})
    }
}

const loggedInUser = async(req, res)=>{
    try {
        const {username, password} = req.body;
        const user = await UserModel.findOne({username});
        if(!user) {
            return res.status(400).json({error:true, message:"User doesn't exist with this username"})
        }
        const isMatchingPassword = await bcrypt.compare(password, user.password);
        if(!isMatchingPassword) {
            return res.status(400).json({error:true, message:"Password is not matching"})
        }

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET_KEY, {expiresIn:'1h'})

        return res.status(200).json({error:false, message:"User loggedin successfully", token})
    } catch(error) {
        return res.status(400).json({error:true, message:error.message})
    }
}

const forgetPassword =async(req, res)=>{
    try {
        const {email} = req.body;
        const user = await UserModel.findOne({email})
        if(!user) {
            return res.status(404).json({error:true, message:"User not found"})
        }
        const transporter = nodemailer.createTransport({
            service:'Gmail',
            auth:{
                user:process.env.EMAIL_ID,
                pass:process.env.EMAIL_PASS
            }
        })

        const resetToken = jwt.sign({id:user._id}, process.env.JWT_SECRET_KEY, {expiresIn:'15m'})

        const mailOption = {
            from:'suvadip.ghosh001@gmail.com',
            to:user.email,
            subject:'Reset Password',
            text:`click the link to reset your password http://localhost:${process.env.PORT}/reset_password/${resetToken}`
        }
        await transporter.sendMail(mailOption)
        return res.status(200).json({message:"password reset mail sent"})
    } catch(error) {
        return res.status(400).json({error:true, message:error.message})
    }
}

module.exports = {registeredUser, loggedInUser, forgetPassword}