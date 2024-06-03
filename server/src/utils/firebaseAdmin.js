import admin from 'firebase-admin'


//firebase initialization
admin.initializeApp({
    credential : admin.credential.cert({
        projectId : process.env.FIREBASE_PROJECT_ID,
        clientEmail : process.env.FIREBASE_CLIENT_EMAIL,
        privateKey : process.env.FIREBASE_PRIVATE_KEY
    }),
})

// database
const db = admin.firestore()


export {db}




