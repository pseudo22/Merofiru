import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
// import { User } from "../collection/user.collection.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { db } from "../utils/firebaseAdmin.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const userCollection = db.collection('users')

const registerUser = asyncHandler(async (req, res) => {
    //get user details from body
    //validate - all fields filled
    //check if user already exists in firestore
    //check for images
    //upload them to cloudinary
    //remove password and token from response, so that it can send to frontend securely
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
    const pfpPath = req.file?.profilePicture[0].path
    console.log(pfpPath);

    if (!pfpPath){
        throw new ApiError(400 , 'profile picture required')
    }
    const pfpurl = await uploadOnCloudinary(pfpPath)

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


export {registerUser}