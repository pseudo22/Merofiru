import express from "express";
import cors from 'cors'
import test from './src/routes/test.js'
import bodyParser from "body-parser";


export const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(bodyParser.json())

// routes for users
app.use('/api' , test)




