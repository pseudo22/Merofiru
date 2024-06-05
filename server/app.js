import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";


export const app = express()
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "20kB"}))
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.use(express.static('public'))

//routes import
import userRouter from './src/routes/user.routes.js'

//routes declaration

//user routes
app.use('/api/users' , userRouter)





