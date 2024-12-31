import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../assets/firebaseConfig";
import switchIcon from '../../images/switchIcon.png';
import removefriend from '../../images/removefriend.png';
import { useNavigate } from "react-router-dom";
import ToastContainer from "../Toast/ToastContainer";
import { setTopMatches } from "../../features/topMatchesSlice";

export default function ChatList() {
    const [userList, setUserList] = useState([]);
    const [switchTo, setSwitchTo] = useState('match');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch()


    const { topMatches } = useSelector((state) => state.topMatches) || []
    const { friends } = useSelector((state) => state.friends) || []

    const toastRef = useRef();

    const userId = useSelector((state) => state.user.userId);
    const userRef = doc(db, 'users', userId);

    useEffect(() => {
        setLoading(true)
        setUserList(switchTo === 'match' ? topMatches : friends);
        setLoading(false);
    }, [switchTo, topMatches, friends]);

    function changeScreen() {
        setSwitchTo((prev) => (prev === 'match' ? 'friends' : 'match'));
    }

    async function removeFromSimilarList(otherUserId) {
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const topMatches = userSnap?.data()?.topMatches || [];
            const updatedtopMatches = topMatches.filter((user) => user.userId !== otherUserId);
            await updateDoc(userRef, {
                topMatches: updatedtopMatches,
            });
            console.log(updatedtopMatches);

            dispatch(setTopMatches(updatedtopMatches))


            if (switchTo === 'match') setUserList(updatedtopMatches)
        }
    }

    async function openChat(otherUserId) {
        const otherUserRef = doc(db, 'users', otherUserId);
        const otherUserSnap = await getDoc(otherUserRef);

        if (otherUserSnap.exists()) {
            const notAllowedUsers = otherUserSnap.data()?.notAllowedUsers || [];

            if (notAllowedUsers) {
                const canChat = notAllowedUsers?.includes(userId);
                if (canChat) {
                    toastRef.current.addToast('you are blocked sadly');
                    return;
                }
            }

            const topMatches = otherUserSnap.data()?.topMatches || [];
            const isTopMatch = topMatches.some((user) => user.userId === userId);

            if (!isTopMatch) {
                toastRef.current.addToast('you are not in the top matches on the other side, send a friend request instead?');
                return;
            }

            navigate(`/chat/${otherUserId}`);
        }
    }

    function openProfile(otherUserName) {
        navigate(`/user/profile/${otherUserName}`);
    }

    return (
        <>
            <ToastContainer ref={toastRef} />
            <div className="layout absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 p-4 -translate-y-1/2 rounded-lg shadow-lg md:w-[80%] w-full h-[77%] md:h-[80%]">
                <div className="flex justify-between items-center">
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
                    {loading && <p className="text-center">loading...</p>}
                    {!loading && userList?.length > 0 ? (
                        userList.map((user, id) => (
                            <div
                                key={id}
                                className="p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md mb-2"
                            >
                                <div className="flex gap-8 items-end">
                                    <p className="font-semibold text-lg md:text-xl">{user.userName}</p>
                                    <p className="text-sm md:text-base">Melo score: {user.similarity}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => openChat(user.userId)}
                                        className="text-sm bg-[#5cc6abeb] text-white md:text-base px-4 py-2 rounded-lg border"
                                    >
                                        Chat
                                    </button>
                                    <button
                                        onClick={() => openProfile(user.userName)}
                                        className="text-sm bg-[#5cc6abeb] text-white md:text-base px-4 py-2 rounded-lg border"
                                    >
                                        View Profile
                                    </button>
                                    {switchTo === 'match' && (
                                        <img
                                            title="Remove"
                                            onClick={() => removeFromSimilarList(user.userId)}
                                            className="cursor-pointer rounded-full"
                                            height={20}
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
                            <p className="text-center">no melos found, try finding some?</p>
                        )
                    )}

                </div>
            </div>
        </>
    );
}
