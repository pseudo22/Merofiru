import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { db, firebaseAdmin } from "../utils/firebaseAdmin.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import CryptoJS from 'crypto-js'
import { log } from "console";



// const userCollection = db.collection('users')

const registerUser = asyncHandler(async (req, res) => {
    // Get user details from body
    try {
        const { email, displayName, password, bio } = req?.body;

        if ([email, displayName].some((all) => all?.trim() === "")) {
            return res.status(400).json(new ApiResponse(400, '', "all fields are required"));
        }
    
        const oldUser = await db.collection('users').where('email', '==', email).get();
    
        if (!oldUser.empty) { // Check if user already exists
            return res.status(400).json(new ApiResponse(400, '', 'user or email already present'));
        }
    
        const pfpPath = req?.file?.path;
    
        let pfpurl;
        try {
            pfpurl = await uploadOnCloudinary(pfpPath);
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            return res.status(500).json(new ApiResponse(500, "", "error while uploading profile picture"));
        }
        
        const decryptedPassword = CryptoJS.AES.decrypt(password , process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8)
        
        let firebaseUser;
        try {
            firebaseUser = await firebaseAdmin.auth().createUser({
                email, password : decryptedPassword, displayName
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json(new ApiResponse(500, '', 'email already exists'));
        }
    
        const userRef = await db.collection('users').doc(firebaseUser.uid).set({
            displayName,
            email,
            profilePicture: pfpurl || process.env.DEFAULT_PFP,
            bio,
            topMatches: [],
            friends: [],
            pendingRequests: [],
            toBeConfirmed: [],
            blockedUsers: [],
            selectedGenre: [],
            presence : true
        });
    
        if (!userRef) {
            return res.status(500).json(new ApiResponse(500, '', 'something went wrong'));
        }
    
        const newUser = await db.collection('users').doc(firebaseUser.uid).get()

        return res.status(200).json(new ApiResponse(200, { user: newUser }, 'user created successfully'));
    } catch (error) {
        console.log(error); 
        return res.status(500).json(new ApiResponse(500, '', 'error while creating user'));
    }
   
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


const sendFriendRequest = asyncHandler(async (req, res) => {
    const { senderId, receiverId, senderName, receiverName } = req.body;
    const usersRef = db.collection('users');
    const senderRef = usersRef.doc(senderId);
    const receiverRef = usersRef.doc(receiverId);

    const senderDoc = await senderRef.get();
    const receiverDoc = await receiverRef.get();

    if (senderDoc.exists && receiverDoc.exists) {
        try {
            const senderData = senderDoc.data();
            const receiverData = receiverDoc.data();

            senderData.toBeConfirmed = senderData.toBeConfirmed || [];
            receiverData.pendingRequests = receiverData.pendingRequests || [];

            const senderAlreadyInReceiverRequests = receiverData.pendingRequests.some(
                request => request.userId === senderId
            );

            const receiverAlreadyInSenderRequests = senderData.toBeConfirmed.some(
                request => request.userId === receiverId
            );

            const senderAlreadyInReceiverFriends = receiverData.friends.some( friend => friend.userId === senderId);
            const receiverAlreadyInSenderFriends = senderData.friends.some( friend => friend.userId === receiverId);

            if (senderAlreadyInReceiverFriends || receiverAlreadyInSenderFriends) {
                return res.status(400).json(new ApiResponse(400, '', 'already friends'));
            }

            if (senderAlreadyInReceiverRequests) {
                return res.status(400).json(new ApiResponse(400, '', 'friend request already sent'));
            }

            if (receiverAlreadyInSenderRequests) {
                return res.status(400).json(new ApiResponse(400, '' , 'you already have this request, check pending melos'));
            }

            senderData.toBeConfirmed.push({ userId: receiverId, userName: receiverName });
            receiverData.pendingRequests.push({ userId: senderId, userName: senderName });

            await senderRef.set({ toBeConfirmed: senderData.toBeConfirmed }, { merge: true });
            await receiverRef.set({ pendingRequests: receiverData.pendingRequests }, { merge: true });

            return res.status(200).json(new ApiResponse(200, '', 'melo request sent'));
        } catch (error) {
            console.log('Error while sending request', error);
            return res.status(500).json(new ApiResponse(500,'' , 'error sending request'));
        }
    } else {
        return res.status(404).json(new ApiResponse(404, '', 'sender or receiver not found'));
    }
}); // end of sendFriendRequest


const confirmFriendRequest = asyncHandler(async (req, res) => {
    const { senderId, receiverId, senderName, receiverName } = req.body;

    const usersRef = db.collection('users');
    const senderRef = usersRef.doc(senderId);
    const receiverRef = usersRef.doc(receiverId);

    try {
        const senderDoc = await senderRef.get();
        const receiverDoc = await receiverRef.get();

        if (senderDoc.exists && receiverDoc.exists) {
            const senderData = senderDoc.data();
            const receiverData = receiverDoc.data();

            senderData.toBeConfirmed = senderData.toBeConfirmed || [];
            receiverData.pendingRequests = receiverData.pendingRequests || [];

            receiverData.toBeConfirmed = senderData.toBeConfirmed || [];
            senderData.pendingRequests = receiverData.pendingRequests || [];

            senderData.friends = senderData.friends || [];
            receiverData.friends = receiverData.friends || [];

            // checking sender friend list
            const senderAlreadyInReceiverFriends = receiverData.friends.some(
                friend => friend.userId === senderId
            );

            // checking receiver friend list
            const receiverAlreadyInSenderFriends = senderData.friends.some(
                friend => friend.userId === receiverId
            );

            if (senderAlreadyInReceiverFriends || receiverAlreadyInSenderFriends) {
                return res.status(400).json(new ApiResponse(400, '', 'already friends'));
            }

            // filter pending requests
            senderData.toBeConfirmed = senderData.toBeConfirmed.filter(request => request.userId !== receiverId);
            receiverData.pendingRequests = receiverData.pendingRequests.filter(request => request.userId !== senderId);

            senderData.pendingRequests = senderData.pendingRequests.filter(req => req.userId !== receiverId)
            receiverData.toBeConfirmed = receiverData.toBeConfirmed.filter(req => req.userId !== senderId)

            senderData.topMatches = senderData.topMatches.filter(req => req.userId !== receiverId)
            receiverData.topMatches = receiverData.topMatches.filter(req => req.userId !== senderId)


            // add friends
            senderData.friends.push({ userId: receiverId, userName: receiverName });
            receiverData.friends.push({ userId: senderId, userName: senderName });

            console.log(senderData.friends , receiverData.friends);
            

            // update both sender and receiver
            await senderRef.set({ toBeConfirmed : senderData.toBeConfirmed  , pendingRequests: senderData.pendingRequests, friends: senderData.friends }, { merge: true });
            await receiverRef.set({ pendingRequests: receiverData.pendingRequests , toBeConfirmed : receiverData.toBeConfirmed , friends: receiverData.friends }, { merge: true });

            return res.status(200).json(new ApiResponse(200, '', 'melo added successfully'));
        } else {
            return res.status(404).json(new ApiResponse(404, '', 'melo not found'));
        }
    } catch (error) {
        console.log('Error confirming friend', error);
        return res.status(500).json(new ApiResponse(500, '', 'errorr'));
    }
}); // end of confirmFriendRequest


const rejectFriendRequest = asyncHandler(async (req, res) => {
    const { senderId, receiverId} = req.body;
    

    const usersRef = db.collection('users');
    const senderRef = usersRef.doc(senderId);
    const receiverRef = usersRef.doc(receiverId);

    try {
        const senderDoc = await senderRef.get();
        const receiverDoc = await receiverRef.get();

        if (senderDoc.exists && receiverDoc.exists) {
            const senderData = senderDoc.data();
            const receiverData = receiverDoc.data();

            receiverData.pendingRequests = receiverData.pendingRequests || [];
            senderData.toBeConfirmed = senderData.toBeConfirmed || [];

            // is sender request pending or not
            const isReceiverRequestPending = receiverData.pendingRequests.some(request => request.userId === senderId);
            const isSenderRequestPending = senderData.toBeConfirmed.some(request => request.userId === receiverId);

            if (!isSenderRequestPending || !isReceiverRequestPending) {
                return res.status(400).json(new ApiResponse(400, '', 'no pending request found'));
            }

            // remove from pending requests
            senderData.toBeConfirmed = senderData.toBeConfirmed.filter(request => request.userId !== receiverId);
            receiverData.pendingRequests = receiverData.pendingRequests.filter(request => request.userId !== senderId);

            // update both sender and receiver
            await senderRef.set({ toBeConfirmed: senderData.toBeConfirmed }, { merge: true });
            await receiverRef.set({ pendingRequests: receiverData.pendingRequests }, { merge: true });

            return res.status(200).json(new ApiResponse(200, '', 'melo request rejected'));
        } else {
            return res.status(404).json(new ApiResponse(404, '', 'melo not found'));
        }
    } catch (error) {
        console.log('Error rejecting friend request', error);
        return res.status(500).json(new ApiResponse(500, '', 'errorr'));
    }
}); // end of rejectFriendRequest 


const cancelFriendRequest = asyncHandler(async (req, res) => {
    const { senderId, receiverId } = req.body;

    const usersRef = db.collection('users');
    const senderRef = usersRef.doc(senderId);
    const receiverRef = usersRef.doc(receiverId);

    try {
        const senderDoc = await senderRef.get();
        const receiverDoc = await receiverRef.get();

        if (senderDoc.exists && receiverDoc.exists) {
            const senderData = senderDoc.data();
            const receiverData = receiverDoc.data();

            senderData.toBeConfirmed = senderData.toBeConfirmed || [];
            receiverData.pendingRequests = receiverData.pendingRequests || [];

            const isSenderRequestPending = senderData.toBeConfirmed.some(user => user.userId === receiverId);
            const isReceiverRequestPending = receiverData.pendingRequests.some(user => user.userId === senderId);

            if (!isSenderRequestPending || !isReceiverRequestPending) {
                return res.status(400).json(new ApiResponse(400, '' , 'no pending request found'));
            }

            senderData.toBeConfirmed = senderData.toBeConfirmed.filter(user => user.userId !== receiverId);
            receiverData.pendingRequests = receiverData.pendingRequests.filter(user => user.userId !== senderId);

            await senderRef.update({ toBeConfirmed: senderData.toBeConfirmed }, { merge: true });
            await receiverRef.update({ pendingRequests: receiverData.pendingRequests }, { merge: true });

            return res.status(200).json(new ApiResponse(200, '', 'melo request canceled'));
        } else {
            return res.status(404).json(new ApiError(404, 'melo not found'));
        }
    } catch (error) {
        console.log('Error canceling friend request', error);
        return res.status(500).json(new ApiError(500, 'error'));
    }
}); // end of cancelFriendRequest


const removeFriend = asyncHandler(async (req, res) => {
    const { userId, friendId } = req.body;

    const usersRef = db.collection('users');
    const userRef = usersRef.doc(userId);
    const friendRef = usersRef.doc(friendId);

    try {
        const userDoc = await userRef.get();
        const friendDoc = await friendRef.get();

        if (!userDoc.exists || !friendDoc.exists) {
            return res.status(404).json(new ApiResponse(404, '', 'melo not found'));
        }

        const userData = userDoc.data();
        const friendData = friendDoc.data();

        // get friends list
        userData.friends = userData.friends || [];
        friendData.friends = friendData.friends || [];

        // check they are friends or not
        const userFriendIndex = userData.friends.findIndex(friend => friend.userId === friendId);
        const friendUserIndex = friendData.friends.findIndex(friend => friend.userId === userId);

        if (userFriendIndex === -1 || friendUserIndex === -1) {
            return res.status(400).json(new ApiResponse(400, '', 'meloship not found'));
        }

        // remove from friends list
        userData.friends = userData.friends.filter(friend => friend.userId !== friendId);
        friendData.friends =  friendData.friends.filter(friend => friend.userId !== userId);

        // remove from top matches
        userData.topMatches = userData?.topMatches || [];
        friendData.topMatches = friendData?.topMatches || [];

        userData.topMatches = userData.topMatches.filter(match => match.userId !== friendId);
        friendData.topMatches = friendData.topMatches.filter(match => match.userId !== userId);

        // update both users
        await userRef.set({ friends: userData.friends, topMatches: userData.topMatches }, { merge: true });
        await friendRef.set({ friends: friendData.friends, topMatches: friendData.topMatches }, { merge: true });

        return res.status(200).json(new ApiResponse(200, '', 'melo removed successfully'));

    } catch (error) {
        console.log('Error while removing friend', error);
        return res.status(500).json(new ApiResponse(500, '', 'errorr'));
    }
}); // end of removeFriend


const blockUser = asyncHandler(async (req, res) => {
    const { userId, toBeBlockedId , userName , toBeBlockedName } = req.body;

    const usersRef = db.collection('users');
    const userRef = usersRef.doc(userId);
    const toBeBlockedUserRef = usersRef.doc(toBeBlockedId);

    try {
        const userDoc = await userRef.get();
        const toBeBlockedUserDoc = await toBeBlockedUserRef.get();

        if (!userDoc.exists || !toBeBlockedUserDoc.exists) {
            return res.status(404).json(new ApiResponse(404, '' , 'melo not found'));
        }

        const userData = userDoc.data();
        const toBeBlockedUserData = toBeBlockedUserDoc.data();

        // if user is trying to block themselves
        if (userId === toBeBlockedId) {
            return res.status(400).json(new ApiResponse(400, '', 'you cannot block yourself-'));
        }

        //  if the user is already blocked
        if (userData.blockedUsers && userData.blockedUsers.includes(toBeBlockedId)) {
            return res.status(400).json(new ApiResponse(400, '', 'melo is already blocked'));
        }

        // the other user has already blocked the user
        if (toBeBlockedUserData.blockedUsers && toBeBlockedUserData.blockedUsers.includes(userId)) {
            return res.status(400).json(new ApiResponse(400, '', 'you are already blocked by this melo :)'));
        }

        // remove from friends and topMatches from both users
        userData.friends = userData.friends || [];
        toBeBlockedUserData.friends = toBeBlockedUserData.friends || [];
        userData.topMatches = userData.topMatches || [];
        toBeBlockedUserData.topMatches = toBeBlockedUserData.topMatches || [];

        userData.friends = userData.friends.filter(friend => friend.userId !== toBeBlockedId);
        toBeBlockedUserData.friends = toBeBlockedUserData.friends.filter(friend => friend.userId !== userId);

        userData.topMatches = userData.topMatches.filter(match => match.userId !== toBeBlockedId);
        toBeBlockedUserData.topMatches = toBeBlockedUserData.topMatches.filter(match => match.userId !== userId);

        // filter in pending requests and to be confirmed
        userData.pendingRequests = userData.pendingRequests || [];
        userData.toBeConfirmed = userData.toBeConfirmed || [];

        toBeBlockedUserData.pendingRequests = toBeBlockedUserData.pendingRequests || [];
        toBeBlockedUserData.toBeConfirmed = toBeBlockedUserData.toBeConfirmed || [];

        userData.pendingRequests = userData.pendingRequests.filter(request => request.userId !== toBeBlockedId);
        userData.toBeConfirmed = userData.toBeConfirmed.filter(request => request.userId !== toBeBlockedId);

        toBeBlockedUserData.pendingRequests = toBeBlockedUserData.pendingRequests.filter(request => request.userId !== userId);
        toBeBlockedUserData.toBeConfirmed = toBeBlockedUserData.toBeConfirmed.filter(request => request.userId !== userId);

        // add to blocked users list only for the blocking user
        userData.blockedUsers = userData.blockedUsers || [];
        userData.blockedUsers.push({ userId: toBeBlockedId, userName: toBeBlockedName });

        await userRef.set({ 
            blockedUsers: userData.blockedUsers, 
            friends: userData.friends, 
            topMatches: userData.topMatches ,
            pendingRequests: userData.pendingRequests,
            toBeConfirmed: userData.toBeConfirmed,
        }, { merge: true });

        await toBeBlockedUserRef.set({ 
            friends: toBeBlockedUserData.friends, 
            topMatches: toBeBlockedUserData.topMatches ,
            pendingRequests: toBeBlockedUserData.pendingRequests,
            toBeConfirmed: toBeBlockedUserData.toBeConfirmed,
        }, { merge: true });

        return res.status(200).json(new ApiResponse(200, '', 'melo blocked now'));
    } catch (error) {
        console.log('Error blocking user', error);
        return res.status(500).json(new ApiResponse(500, '' , 'error blocking'));
    }
}); // end of blockUser


const unblockUser = asyncHandler(async (req, res) => {
    const { userId, toBeUnblockedId } = req.body;

    const usersRef = db.collection('users');
    const userRef = usersRef.doc(userId);
    const toBeUnblockedUserRef = usersRef.doc(toBeUnblockedId);

    try {
        const userDoc = await userRef.get()
        const toBeUnblockedUserDoc = await toBeUnblockedUserRef.get()

        if (!userDoc.exists || !toBeUnblockedUserDoc.exists) {
            return res.status(404).json(new ApiResponse(404, '', 'melo not found'));
        }

        const userData = userDoc.data()

        userData.blockedUsers = userData?.blockedUsers || [];
        
        userData.blockedUsers = userData.blockedUsers?.filter(user => user.userId !== toBeUnblockedId)

        await userRef.set({ blockedUsers: userData.blockedUsers }, { merge: true })

        return res.status(200).json(new ApiResponse(200, '', 'melo unblocked now'));
    } catch (error) {
        console.log('Error unblocking user', error);
        return res.status(500).json(new ApiResponse(500, '', 'error unblocking'));
    }
}); // end of unblockUser



export {
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    sendFriendRequest, cancelFriendRequest, confirmFriendRequest, rejectFriendRequest, removeFriend, blockUser
    , unblockUser
     
}

// 1 user ---- to be confirmed ---> vo vli requests jo current user ne bhej rkhi h aur wait kr rha h saamne vle k confirmation k
// 1 user ---- pending request ---> jo user pr aa rkhi h aur usne accept ya reject krni h
