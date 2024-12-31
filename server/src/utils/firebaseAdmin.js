import admin from 'firebase-admin'
// environment variables
import dotenv from 'dotenv'
dotenv.config({
    path : './.env'
})


//firebase initialization
const firebaseAdmin = admin.initializeApp({
    credential : admin.credential.cert({
        projectId : process.env.FIREBASE_PROJECT_ID,
        clientEmail : process.env.FIREBASE_CLIENT_EMAIL,
        privateKey : process.env.FIREBASE_PRIVATE_KEY
    }),
})

// database
const db = admin.firestore()


export {db , firebaseAdmin}




