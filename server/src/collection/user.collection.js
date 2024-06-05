import { db } from "../utils/firebaseAdmin"

class User {
    constructor(
        userId,
        displayName,
        email,
        profilePicture,
        bio = "",
        presence = false
    ){
        this.userId = userId
        this.displayName = displayName
        this.email = email
        this.profilePicture = profilePicture
        this.bio = bio
        this.presence = presence
        this.userRef = db.collection('users').doc(userId)
    }
}
export {User}


// const userCollection = db.collection('users')

// //add user
// const addUser = (async (userID) => {
//     const userRef = await userCollection.add(userID)
//     return userRef.id
// })

// //get user
// const getUser = async (userId) => {
//     const userDoc = await userCollection.doc(userId).get()
//     return userDoc.data()
// };

// //update user

// const updateUser = async (userId, payload) => {
//     await userCollection.doc(userId).update(payload);
//   };
  
// //delete user

// const deleteUser = async (userID) => {
//       await db.collection('users').doc(userID).delete();
// }

// export {addUser , getUser , updateUser , deleteUser}



