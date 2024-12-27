import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
// import { User } from "../collection/user.collection.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { db, firebaseAdmin } from "../utils/firebaseAdmin.js";
import { ApiResponse } from "../utils/ApiResponse.js";



// const userCollection = db.collection('users')

const registerUser = asyncHandler(async (req, res) => {
    // Get user details from body

    const { email, displayName, password, bio } = req?.body;

    if ([email, displayName].some((all) => all?.trim() === "")) {
        return res.status(400).json(new ApiError(400, '', "all fields are required"));
    }

    const oldUser = await db.collection('users').where('email', '==', email).get();

    if (!oldUser.empty) { // Check if user already exists
        return res.status(400).json(new ApiError(400, '', 'user or email already present'));
    }

    const pfpPath = req?.file?.path;

    let pfpurl;
    try {
        pfpurl = await uploadOnCloudinary(pfpPath);
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return res.status(500).json(new ApiError(500, "", "error while uploading profile picture"));
    }

    let firebaseUser;
    try {
        firebaseUser = await firebaseAdmin.auth().createUser({
            email, password, displayName
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(new ApiError(500, '', 'error creating user in firebase auth'));
    }

    const userRef = await db.collection('users').doc(firebaseUser.uid).set({
        displayName,
        email,
        profilePicture: pfpurl || process.env.DEFAULT_PFP,
        bio,
        presence: true,
        similarUsers: []
    });

    if (!userRef) {
        return res.status(500).json(new ApiError(500, '', 'something went wrong'));
    }

    const newUser = await db.collection('users').doc(firebaseUser.uid).get()


    return res.status(200).json(new ApiResponse(200, { user: newUser }, 'user created successfully'));
});



const loginUser = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json(new ApiError(400, '', 'Email is required'));
    }

    try {
        const userEmail = await firebaseAdmin.auth().getUserByEmail(email).then((res) => res.email).catch((err) => {
            console.error("Error fetching user by email:", err);
            return null;
        });

        if (!userEmail) {
            return res.status(404).json(new ApiError(404, '', 'User not found'));
        }

        db.collection('users').where('email', '==', userEmail).get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    return res.status(404).json(new ApiError(404, '', 'User not found'));
                }

                const user = querySnapshot.docs[0].data();
                return res.status(200).json(new ApiResponse(200, { userId: querySnapshot.docs[0].id }, 'Login successful'));
            })
            .catch((err) => {
                console.error('Error querying database:', err);
                return res.status(500).json(new ApiError(500, '', 'Error while fetching user data'));
            });

    } catch (error) {
        console.log('Error during authentication', error);
        return res.status(401).json(new ApiError(401, '', 'Authentication failed'));
    }
});


const logoutUser = asyncHandler(async (req, res) => {
    const uid = req.user?.uid;

    if (!uid) {
        return res.status(401).json(new ApiError(401, '', 'invalid user trying to logout'));
    }

    try {
        await firebaseAdmin.auth().revokeRefreshTokens(uid);
        return res.status(200).json(new ApiResponse(200, '', 'logout success'));
    } catch (error) {
        console.log('error is', error);
        return res.status(500).json(new ApiError(500, '', 'error while logging out'));
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const { bio, userId } = req.body
  
    if (!userId) {
      return res.status(400).json(new ApiResponse(400, '', 'User ID is required'));
    }
  
    try {
      const userDoc = await db.collection('users').doc(userId).get();
  
      if (!userDoc.exists) {
        return res.status(404).json(new ApiResponse(404, '', 'User not found'));
      }
  
      let pfpurl = userDoc.data().profilePicture; 
  
      if (req.file) {
        try {
          pfpurl = await uploadOnCloudinary(req.file.path); 
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          return res.status(500).json(new ApiResponse(500, "", "Error while uploading profile picture"));
        }
      }

      if (bio && bio.trim() !== userDoc.data().bio.trim()) {
        await userDoc.ref.update({ bio }); 
      }
  
      if (pfpurl !== userDoc.data().profilePicture) {
        await userDoc.ref.update({ profilePicture: pfpurl }); 
      }
  
      return res.status(200).json(new ApiResponse(200, '', 'User updated successfully'));
  
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json(new ApiResponse(500, '', 'Something went wrong'));
    }
  });

export {
    registerUser,
    loginUser,
    logoutUser,
    updateUser
}
