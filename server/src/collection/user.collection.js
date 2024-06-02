import {db} from '../utils/firebaseAdmin.js'
import {asyncHandler} from '../utils/asyncHandler.js'
const userCollection = db.collection('users')

//add user
const addUser = (async (userID) => {
    const userRef = await userCollection.add(userID)
    return userRef.id
})

//get user
const getUser = async (userId) => {
    const userDoc = await userCollection.doc(userId).get()
    return userDoc.data()
};

//update user

const updateUser = async (userId, payload) => {
    await userCollection.doc(userId).update(payload);
  };
  
//delete user

const deleteUser = async (userID) => {
      await db.collection('users').doc(userID).delete();
}

export {addUser , getUser , updateUser , deleteUser}



