import {db} from '../utils/firebaseAdmin.js'
import {asyncHandler} from '../utils/asyncHandler.js'
const userCollection = db.collection('users')

//add user
const addUser = (async (req,res) => {
    const user = req.body
    const userRef = await userCollection.add(user)
    return userRef.id
})

//get user
const getUser = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required')
    }
    const userDoc = await userCollection.doc(userId).get()
    if (!userDoc.exists){
        throw new Error('User not found')
    }
    return userDoc.data()
};


//update user

const updateUser = async (userId, payload) => {
    if (!userId) {
      throw new Error('No user ID provided')
    }
    if (!payload) {
      throw new Error('No update data provided')
    }
    await userCollection.doc(userId).update(payload);
  };
  
//delete user

const deleteUser = async (req, res) => {
    const idDelete = req.body.id;
    if (!idDelete) {
      return res.status(400).json({ message: 'ID is required' })
    }
  
    try {
      await db.collection('users').doc(idDelete).delete();
      res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  };

export {addUser , getUser , updateUser , deleteUser}



