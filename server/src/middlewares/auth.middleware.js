import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { asyncHandlerSocket } from "../utils/asyncHandlerSocket.js";
import { firebaseAdmin } from "../utils/firebaseAdmin.js";

// 
const authenticate = asyncHandler(async (req , res , next) => {
    let idToken = req.headers.authorization?.split('Bearer ')[1]
    if (!idToken){
        throw new ApiError(401 , 'Unauthorized')
    }
    try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken)
        req.user = decodedToken
        next()
    } catch (error) {
        console.error('Error verifying token:', error.message)
        throw new ApiError(401 , 'Not authorized')
    }
})


const authenticateSocket = asyncHandlerSocket(async (socket, next) => {

    const token = socket.handshake.query.token

    if (!token) {
      console.log('token not found')
    }
  
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      socket.user = decodedToken
      next()
    } catch (error) {
      console.error('Error verifying token:', error.message);
      return next(new Error('Not authorized'));
    }
  })


export {authenticate , authenticateSocket}