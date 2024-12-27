
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getToken } from '../assets/firebaseConfig';
import { setUser, resetUser, setToken } from '../features/userSlice.js';
import { useDispatch } from 'react-redux';

const useAuth = () => {

    const dispatch = useDispatch()
    const [loading , setLoading] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async(user) => {
            if (user && navigator.onLine) {
                console.log('user logged in');

                const token = await getToken()                

                dispatch(setUser({ userId: user.uid, userName: user.displayName || 'stranger' }));
                dispatch(setToken({token : token}))
            } else {
                console.log('user logged out')
                dispatch(resetUser());
            }
            setLoading(false)
        });
    
        return () => unsubscribe();
    }, [dispatch]);

    return {loading}
}

export default useAuth
