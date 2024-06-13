import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
// import { User } from "../collection/user.collection.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { db, firebaseAdmin } from "../utils/firebaseAdmin.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// const userCollection = db.collection('users')

const registerUser = asyncHandler(async (req, res) => {
    //get user details from body
    //validate - all fields filled
    //check if user already exists in firestore
    //check for images
    //upload them to cloudinary
    //check for user creation response(success or failure)
    //return response
    const {email, displayName, bio} = req?.body
    
    if (
        [email,displayName].some((all) => all?.trim() === "")
    ){
        throw new ApiError(400 , "all fields are required")
    }
    if (!email.includes("@")){
        throw new ApiError(400 , "invalid email")
    }
    const userExists = await db.collection('users').where('email' , '==' , email).get()
    if (!userExists.empty){
        throw new ApiError(400 , 'user already exists')
    }
    const pfpPath = req.file?.path
    // console.log(pfpPath);

    if (!pfpPath){
        throw new ApiError(400 , 'profile picture required')
    }
    const pfpurl = await uploadOnCloudinary(pfpPath)
    if (pfpurl == null){
        throw new ApiError(500, 'error while uploading to server')
    }
    // console.log(pfpurl);

    const userRef = await db.collection('users').add({
        displayName,
        email,
        profilePicture: pfpurl,
        bio,
        presence: true
    })
    if (!userRef){
        throw new ApiError(500 , 'something went wrong')
    }
    // console.log(email , displayName , pfpPath , userExists)
    return res.status(200).json(
        new ApiResponse(200 , 'user created successfully')
    )
    
})

const loginUser = asyncHandler(async (req,res) => {
    //take token from req.user 
    //check token came or not from frontend
    //decode the token
    //send the message for success or failure
    const {token} = req.body
    if (!token){
        throw new ApiError(400 , 'token is required')
    }
    try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token)
        const uid = decodedToken?.uid

        const response = new ApiResponse(200, { uid, token: decodedToken }, 'Login successfull');

        res.status(response.statusCode).json(response);
        
    } catch (error) {
        console.log('error while authentication',error)
        throw new ApiError(400 , 'authentication failed')

    }
})

const logoutUser = asyncHandler(async (req,res) => {
    // get user uid
    // autheticate the token with the help of auth middleware
    // judge logout
    const uid = req.user?.uid
    if (!uid) {
        throw new ApiError(401 , 'invalid user trying to logout')
    }
    try {
        await firebaseAdmin.auth().revokeRefreshTokens(uid)
        res.status(200).json(
            new ApiResponse(200 , 'logout success')
        )
        
    } catch (error) {
        console.log('error is',error)
        throw new ApiError(500 , 'error while logging out')
    }
})


export {registerUser,
    loginUser,
    logoutUser
}