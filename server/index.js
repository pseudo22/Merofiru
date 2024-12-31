import dotenv from "dotenv";
import {app} from './app.js';

//env config

dotenv.config({
    path : './.env'
})



import http from 'http'
const server = http.createServer(app)



// socket
import { setupSocket } from "./src/sockets/socket.js";

const io = setupSocket(server)


//app start


const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});



