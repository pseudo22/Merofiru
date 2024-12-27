import dotenv from "dotenv";
import {app} from './app.js';

//env config

dotenv.config({
    path : './.env'
})


import http from 'http'
import { Server } from 'socket.io'
import { ApiError } from "./src/utils/ApiError.js";
import { authenticateSocket } from "./src/middlewares/auth.middleware.js";


// socket 

const server = http.createServer(app)
const io = new Server(server , {
  cors:{
    origin: process.env.CORS_ORIGIN,
    methods : ['GET' , 'POST'],
    credentials: true
  }
})


io.use(authenticateSocket)


io.on('connection', (socket) => {
    console.log(`user connected with socket` , socket.id);
  
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
  });


//app start


const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});



