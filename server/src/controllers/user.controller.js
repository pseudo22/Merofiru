import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../collection/user.collection.js";

const registerUser = asyncHandler(async (req, res) => {
    //get user details from body
    //validate - all fields filled
    //check if user already exists in firestore
    //check for images
    //upload them to cloudinary
    //remove password and token from response, so that it can send to frontend securely
    //check for user creation response(success or failure)
    //return response
    const {email, userName , passWord ,genrePreference , profilePicture , bio} = req.body
    console.log(email , userName,passWord);
    
    if (
        [email,userName,passWord].some((all) => all?.trim() === "")
    ){
        throw new ApiError(400 , "all fields are required")
    }
    if (!email.includes("@")){
        throw new ApiError(400 , "invalid email")
    }
    
    

    
})




export {registerUser}