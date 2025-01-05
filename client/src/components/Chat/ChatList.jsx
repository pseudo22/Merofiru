import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../assets/firebaseConfig";
import switchIcon from '../../images/switchIcon.png';
import removefriend from '../../images/removefriend.png';
import { useNavigate } from "react-router-dom";
import ToastContainer from "../Toast/ToastContainer";
import { setTopMatches } from "../../features/topMatchesSlice";
import CryptoJS from 'crypto-js';

export default function ChatList() {
    const [userList, setUserList] = useState([]);
    const [switchTo, setSwitchTo] = useState('match');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch()

    const { topMatches } = useSelector((state) => state.topMatches) || []
    const { friends } = useSelector((state) => state.friends) || []

    const toastRef = useRef();

    const userId = useSelector((state) => state.user.userId)

    useEffect(() => {
        setLoading(true)
        setUserList(switchTo === 'match' ? topMatches : friends);
        setLoading(false);
    }, [switchTo, topMatches, friends]);

    function changeScreen() {
        setSwitchTo((prev) => (prev === 'match' ? 'friends' : 'match'));
    }

    async function removeFromSimilarList(otherUserId) {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const topMatches = userSnap?.data()?.topMatches || [];
            const updatedtopMatches = topMatches.filter((user) => user.userId !== otherUserId);
            await updateDoc(userRef, {
                topMatches: updatedtopMatches,
            })

            dispatch(setTopMatches(updatedtopMatches))
            if (switchTo === 'match') setUserList(updatedtopMatches)
        }
    }

    async function openChat(otherUserId) {
        setLoading(true);
        if(switchTo === 'match') {
        const otherUserRef = doc(db, 'users', otherUserId);
        const otherUserSnap = await getDoc(otherUserRef);

        if (otherUserSnap.exists()) {
            const notAllowedUsers = otherUserSnap.data()?.notAllowedUsers || [];

            if (notAllowedUsers) {
                const canChat = notAllowedUsers?.includes(userId);
                if (canChat) {
                    toastRef.current.addToast('you are blocked sadly');
                    setLoading(false);
                    return;
                }
            }

            const topMatches = otherUserSnap.data()?.topMatches || [];
            const isTopMatch = topMatches.some((user) => user.userId === userId);

            if (!isTopMatch) {
                toastRef.current.addToast('you are not in the top matches on the other side, send a friend request instead?');
                setLoading(false);
                return;
            }
        }
            
    }
            const encryptedUserId =  CryptoJS.AES.encrypt(otherUserId, import.meta.env.VITE_SECRET_KEY).toString()
            const urlSafeEncryptedUserId = encryptedUserId.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

            navigate(`/chat/${urlSafeEncryptedUserId}`);
            setLoading(false);
    }

    function openProfile(otherUserName) {
        navigate(`/user/profile/${otherUserName}`);
    }

    return (
        <>
            <ToastContainer ref={toastRef} />
            <div className="layout absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 p-4 -translate-y-1/2 rounded-lg shadow-lg w-full md:w-[60%] h-[77%] md:h-[80%]">
                <div className="flex  justify-between items-center">
                    <h1 className="text-2xl text-white md:text-3xl font-semibold">
                        {switchTo === 'match' ? 'your matches' : 'your melos'}
                    </h1>
                    <img
                        src={switchIcon}
                        alt="Switch Icon"
                        className="cursor-pointer"
                        width={30}
                        height={30}
                        onClick={changeScreen}
                    />
                </div>

                <div className="flex-grow overflow-y-auto">
                    {loading && <p className="text-center text-sm md:text-base">loading...</p>}
                    {!loading && userList?.length > 0 && userList ? (
                        userList.map((user, id) => (
                            <div
                                key={id}
                                className="p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md mb-2"
                            >
                                <div className="flex gap-8 items-end">
                                    <p className="font-semibold text-lg md:text-xl">{user.userName}</p>
                                    {switchTo === 'match' ? (<p className="text-sm md:text-base">melo score: {user.similarity}</p>) : ('')}
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => openChat(user.userId)}
                                        disabled={loading}
                                        className="text-sm bg-[#5cc6abeb] text-white md:text-base px-4 py-2 rounded-lg border"
                                    >
                                        {loading ? 'opening chat-' : 'chat'}
                                    </button>
                                    <button
                                        onClick={() => openProfile(user.userName)}
                                        className="text-sm bg-[#5cc6abeb] px-2 py-2 text-white md:text-base rounded-lg border"
                                    >
                                        view profile
                                    </button>
                                    {switchTo === 'match' && (
                                        <img
                                            title="remove friend"
                                            onClick={() => removeFromSimilarList(user.userId)}
                                            className="cursor-pointer rounded-full"
                                            height={30}
                                            width={40}
                                            src={removefriend}
                                            alt="Remove"
                                        />
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && (
                            <p className="text-center text-sm md:text-base">no melos found, try finding some?</p>
                        )
                    )}
                </div>
            </div>
        </>

    );
}



// redux m save kraa lo last message jo jo current user k not seeen h, bs last message
// and jo not seen h, unke upr ek cheez jo btaye ki not seen h