import {db} from '../utils/firebaseAdmin.js'
import {asyncHandler} from '../utils/asyncHandler.js'
const userCollection = db.collection('users')

//add user
const addUser = asyncHandler(async (req,res) => {
    const user = req.body // getting data from http post req body
    const userRef = await userCollection.add(user)
    return userRef.id
})

//get user
const getUser = asyncHandler(async (req , res) => {
    const id = req.params.id //id from req parameter
    const userDoc = await userCollection.doc(id).get()
    if (!userDoc.exists){
        return null
    }
    return userDoc.data()
})

//update user

const updateUser = asyncHandler(async (req,res) => {
    const idUpdate = req.params.id
    const update = req.body
    await userCollection.doc(idUpdate).update(update)
    return {id : idUpdate , ...update}
})

//delete user

const deleteUser = asyncHandler(async (req,res) => {
    const idDelete = req.params.id
    await userCollection.doc(idDelete).delete()
})

export {addUser , getUser , updateUser , deleteUser}



