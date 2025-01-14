import { initializeApp } from 'firebase/app';
import {  browserSessionPersistence, getAuth} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);

auth.setPersistence(browserSessionPersistence)
  .catch((err) => {
    console.error('error setting persistence:', err.message);
  });

const db = getFirestore(app)

// get token 


const getToken = async () => {
  
  const user = auth.currentUser
  
  if (user){
      try {
          const token = await user.getIdToken()
          return token
      } catch (error) {
          console.log('error fetching token');
      }
  }
  return null
}


export { app, auth, db, getToken };
