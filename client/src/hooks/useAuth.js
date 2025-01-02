import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getToken } from '../assets/firebaseConfig';
import { setUser, clearUser, setToken, setUserGenres , setToBeConfirmed ,
  setBlockedUsers , setPendingRequests
} from '../features/userSlice';
import { setTopMatches, clearTopMatches } from '../features/topMatchesSlice';
import { setFriends, clearFriends } from '../features/friendsSlice';
import { useDispatch } from 'react-redux';
import { db } from '../assets/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const useAuth = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentUser = null;

    const updatePresence = async (user, presence) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { presence });
        } catch (error) {
          console.error('Error updating presence:', error.message);
        }
      }
    };

    const handleAuthStateChange = async (user) => {
      if (user && navigator.onLine) {
        try {
          currentUser = user;

          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const token = await getToken();

            const genreRefs = userData?.selectedGenre || [];
            const topMatches = userData?.topMatches || [];
            const friends = userData?.friends || [];

            const genres = await Promise.all(
              genreRefs.map(async (ref) => {
                const genreSnap = await getDoc(ref);
                return genreSnap.exists()
                  ? {
                      id: genreSnap.id,
                      genre: genreSnap.data().genre,
                      description: genreSnap.data().description,
                      color: genreSnap.data().color,
                    }
                  : null;
              })
            );

            dispatch(
              setUser({
                userId: user.uid,
                userName: user.displayName || 'stranger',
                genreList: genres.filter((genre) => genre !== null),
                profile: userData?.profilePicture,
                bio: userData?.bio,
              })
            );
            dispatch(setToken({ token }));
            dispatch(setUserGenres({ selectedGenres: genres.filter((genre) => genre !== null) }));
            dispatch(setTopMatches({ topMatches  }));
            dispatch(setFriends({ friends }));
            dispatch(setToBeConfirmed({ toBeConfirmed : userData?.toBeConfirmed || [] })); 
            dispatch(setBlockedUsers({ blockedUsers : userData?.blockedUsers || [] }));
            dispatch(setPendingRequests({ pendingRequests : userData?.pendingRequests || [] , pendingRequestsCount : userData?.pendingRequests?.length || 0 }));

            await updatePresence(user, true);
          }
        } catch (error) {
          console.error('Error handling auth state:', error.message);
        }
      } else {
        console.log('User logged out or offline');
        if (currentUser) {
          await updatePresence(currentUser, false);
          currentUser = null;
        }
        dispatch(clearUser());
        dispatch(clearTopMatches());
        dispatch(clearFriends());
      }
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);

    const handleBeforeUnload = async () => {
      if (currentUser) {
        await updatePresence(currentUser, false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dispatch]);

  return { loading };
};

export default useAuth;
