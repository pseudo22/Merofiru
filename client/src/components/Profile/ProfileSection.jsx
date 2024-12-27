import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../assets/firebaseConfig.js";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import Profile from "./Profile.jsx";

export default function ProfileSection() {
    const params = useParams();
    const [canUpdate, setCanUpdate] = useState(false);
    const [pfp, setPfp] = useState(null);
    const [userName, setUserName] = useState("");
    const [genres, setGenres] = useState([]);
    const [bio, setBio] = useState("");
    const currentUserName = useSelector((state) => state.user.userName);
    const [userFound, setUserFound] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const profileView = params.user;
                const userRef = collection(db, "users");

                const userQuery = query(userRef, where("displayName", "==", profileView));
                const userSnap = await getDocs(userQuery);

                if (!userSnap.empty) {
                    const userData = userSnap.docs[0].data();
                    const userGenreRefs = userData?.selectedGenre || [];

                    const genreList = [];
                    for (const genre of userGenreRefs) {
                        const genreDoc = await getDoc(genre);
                        if (genreDoc?.exists()) {
                            const userGenres = {
                                genre: genreDoc.data().genre,
                                description: genreDoc.data().description,
                                color: genreDoc.data().color,
                            };
                            genreList.push(userGenres);
                        }
                    }

                    setGenres(genreList);
                    setPfp(userData?.profilePicture || null);
                    setUserName(userData?.displayName || null);
                    setBio(userData?.bio || null);
                } else {
                    setUserFound(false)
                }

                setCanUpdate(currentUserName?.trim() === profileView?.trim());
            } catch (error) {
                console.error("error fetching user profile:", error);
            }
        };

        fetchUserProfile()
    }, [params.user, currentUserName]);

    return (
        <>
            {userFound ?
             (
             <Profile canUpdate={canUpdate} pfp={pfp} userName={userName} bio={bio} genres={genres} />
             ) : 
             
             <div className="absolute text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-2 items-center gap-y-4 p-4 flex flex-col rounded-lg bg-[#4e736a] shadow-lg md:w-96 w-full h-auto">
                searched melophile not discovered right now 
            </div>}
        </>
    );
}