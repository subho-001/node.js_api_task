const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const app = express();

app.use(express.json())

const userRouter = require('./routers/userRouter')


mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("mongodb connected");
    
}).catch((err)=>{
    console.log("mongodb connection error", err.message);
    
})

app.use((err, req, res, next)=>{
    return res.status(500).json({error:true, message:err.message})
})

app.use('/api/user', userRouter)

app.listen((process.env.PORT),()=>{
    console.log(`mongodb connected on port ${process.env.PORT}`);
})