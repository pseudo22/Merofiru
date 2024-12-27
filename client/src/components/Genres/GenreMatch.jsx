import { useRef, useState } from "react"
import { useSelector } from "react-redux"
import { ApiClient } from "../../assets/axios.js"
import { db } from "../../assets/firebaseConfig.js"
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import ToastContainer from "../Toast/ToastContainer.jsx";

export default function GenreMatch() {

    const [compatiblePeople, setCompatiblePeople] = useState([])
    const [loading, setLoading] = useState(false)
    const userId = useSelector((state) => state.user.userId)

    const navigate = useNavigate()
    const toastRef = useRef()

    async function fetchSimilarGenre() {
        setLoading(true)
        try {
            const response = await ApiClient.post('/api/genre//fetch-similar', { userId: userId })

            const responseData = response?.data.data
            const userDetails = await Promise.all(
                responseData?.map(async (user) => {
                    const userRef = doc(db, 'users', user.userId)
                    const userSnap = await getDoc(userRef)

                    if (userSnap.exists()) {
                        return {
                            userId: user.userId,
                            userName: userSnap.data().displayName,
                            profilePicture: userSnap.data().profilePicture,
                            similarity: user.similarity
                        }

                    }
                })
            )
            setCompatiblePeople(userDetails)
            toastRef.current.addToast('melophiles for you')

        } catch (error) {
            toastRef.current.addToast('errorr')

            console.log('error while matching');

        } finally {
            setLoading(false)
        }
    }

    function goChat(userId){
        navigate(`/user/chat/${userId}`)
    }


    return (
        <>
            <ToastContainer ref={toastRef} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-2 items-center gap-y-4 p-4 flex flex-col rounded-lg bg-[#CCD0CF] shadow-lg md:w-96 w-full h-auto">
                <button disabled={loading} className="text-[#289177] py-2 px-4 rounded-lg  w-full mt-4 transition-all" onClick={fetchSimilarGenre}>
                    {loading ? (
                        <p>take deep breaths</p>
                    ) : (
                        <p>find awesome persons like you?</p>
                    )}
                </button>

                {compatiblePeople.length > 0 && (
                    <div className="mt-4 space-y-4">
                        {compatiblePeople.map((person) => (
                            <div key={person.userId} className="flex items-center justify-between p-2 shadow-md rounded-md">
                                <div className="flex items-center">
                                    <img
                                        src={person.profilePicture || '/default-avatar.png'}
                                        alt={person.userName}
                                        className="w-12 h-12 rounded-full mr-3"
                                    />
                                    <div>
                                        <h3 className="font-semibold">{person.userName}</h3>
                                        <p>{person.similarity}% compatibility</p>
                                    </div>
                                </div>
                                <button onClick={()=>goChat(person.userId)} className=" px-4 py-2 rounded-lg">Chat</button>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </>
    )
}