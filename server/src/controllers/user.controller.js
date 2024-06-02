import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";


const registerUser = asyncHandler(async (req, res) => {
    //get user details from body
    //validate - all fields filled
    //check if user already exists in firestore
    //check for images
    //upload them to cloudinary
    //remove password and token from response, so that it can send to frontend securely
    //check for user creation response(success or failure)
    //return response

    const {email, username , password} = req.body
    console.log(email , username,password);
    
    if (
        [email,username,password].some((all) => all?.trim() === "")
    ){
        throw new ApiError(400 , "all fields are required")
    }
    if (!email.includes("@")){
        throw new ApiError(400 , "invalid email")
    }
    

    
})




export {registerUser}