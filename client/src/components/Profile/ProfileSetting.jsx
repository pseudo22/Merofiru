import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ApiClient } from "../../assets/axios";
import ToastContainer from "../Toast/ToastContainer";
import { setBlockedUsers, setToBeConfirmed, setPendingRequests, clearUser } from "../../features/userSlice";
import { clearFriends, setFriends } from "../../features/friendsSlice";
import { auth, db } from "../../assets/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

import gsap from 'gsap';
import { signOut } from "firebase/auth";
import { clearTopMatches } from "../../features/topMatchesSlice";

gsap.config({ nullTargetWarn: false })

export default function ProfileSetting() {
    const { userId, userName, profile, blockedUsers, pendingRequests, pendingRequestsCount, toBeConfirmed } = useSelector((state) => state.user);
    
    const { friends } = useSelector((state) => state.friends);

    const [activeList, setActiveList] = useState(null);
    const [localFriendList, setLocalFriendList] = useState(friends);
    const [localPendingRequests, setLocalPendingRequests] = useState(pendingRequests);
    const [localBlockedUsers, setLocalBlockedUsers] = useState(blockedUsers);
    const [localToBeConfirmed, setLocalToBeConfirmed] = useState(toBeConfirmed);
    const [localPendingRequestsCount, setLocalPendingRequestsCount] = useState(pendingRequestsCount || 0);
    const [isLoading, setIsLoading] = useState(false);

    const listRef = useRef(null);
    const toastRef = useRef(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();


    const handleLogout = async () => {
        setIsLoading(true);

        try {
            dispatch(clearUser());
            dispatch(clearTopMatches())
            dispatch(clearFriends())

            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, { presence: false })

            await signOut(auth);

            toastRef.current.addToast("see you again!!");

            setTimeout(() => {
                navigate("/login");
            }, 2000);


        } catch (error) {
            toastRef.current.addToast(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleOutsideClick = (e) => {
        if (listRef.current && !listRef.current.contains(e.target)) {
            closeListWithAnimation();
        }
    };

    const handleOpenList = (listName) => {
        if (activeList === listName) return;
        closeListWithAnimation(() => {
            setActiveList(listName);
        });
    };

    const closeListWithAnimation = (callback) => {
        if (listRef.current) {
            gsap.to(listRef.current, {
                opacity: 0,
                scale: 0.9,
                duration: 0.3,
                onComplete: () => {
                    setActiveList(null);
                    if (callback) callback();
                },
            });
        } else if (callback) {
            callback();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    useEffect(() => {
        if (listRef.current && activeList) {

            gsap.fromTo(
                listRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.3 }
            );


            const listItems = listRef.current.querySelectorAll(".list-item");
            gsap.fromTo(
                listItems,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.3, stagger: 0.1 }
            );
        }
    }, [activeList]);

    function goToProfile(userName) {
        navigate(`/user/profile/${userName}`);

    }

    async function acceptFriend(receiverId, receiverName) {
        try {
            const response = await ApiClient.post("api/user/confirm-friend-request", {
                senderId: userId,
                senderName: userName,
                receiverName,
                receiverId
            });

            if (response.data.success) {
                const updatedPendingRequests = localPendingRequests.filter(user => user.userId !== receiverId);
                const updatedPendingRequestsCount = updatedPendingRequests.length;

                setLocalPendingRequests(updatedPendingRequests);
                setLocalPendingRequestsCount(updatedPendingRequestsCount);

                dispatch(setPendingRequests({ pendingRequests: updatedPendingRequests, pendingRequestsCount: updatedPendingRequestsCount }));

                setLocalFriendList([...localFriendList, { userName: receiverName, userId: receiverId }]);
                dispatch(setFriends({ friends: localFriendList }));
            }

            toastRef.current.addToast(response?.data.message);
        } catch (error) {
            toastRef.current.addToast(error?.response?.data.message);
        }
    }


    async function rejectFriend(senderId) {
        try {
            const response = await ApiClient.post("api/user/reject-friend-request", { senderId: senderId, receiverId: userId });
            if (response.data.success) {

                const updatedPendingRequests = localPendingRequests?.filter(user => user.userId !== senderId);

                setLocalPendingRequests(updatedPendingRequests);
                dispatch(setPendingRequests({ pendingRequests: updatedPendingRequests, pendingRequestsCount: updatedPendingRequests?.length }));
                setLocalPendingRequestsCount(updatedPendingRequests?.length);
            }
            toastRef.current.addToast(response.data.message);
        } catch (error) {
            toastRef.current.addToast(error?.response?.data.message)
        }
    }


    async function removeFriend(receiverId) {
        try {
            const response = await ApiClient.post("api/user/remove-friend", { userId: userId, friendId: receiverId });
            if (response.data.success) {
                setLocalFriendList(localFriendList.filter(user => user.userId !== receiverId));
                dispatch(setFriends({ friends: localFriendList }));
            }
            toastRef.current.addToast(response.data.message);
        } catch (error) {
            toastRef.current.addToast(error?.response?.data.message)
        }
    }

    async function unblockUser(toBeUnblockedId) {
        try {
            const response = await ApiClient.post("api/user/unblock-user", { userId: userId, toBeUnblockedId });
            if (response.data.success) {
                setLocalBlockedUsers(localBlockedUsers.filter(user => user.userId !== toBeUnblockedId));
                dispatch(setBlockedUsers({ blockedUsers: localBlockedUsers }));
            }
            toastRef.current.addToast(response.data.message);

        } catch (error) {
            toastRef.current.addToast(error?.response?.data.message)
        }
    }

    async function cancelFriendRequest(receiverId) {
        try {
            const response = await ApiClient.post("api/user/cancel-friend-request", { senderId: userId, receiverId });
            if (response.data.success) {
                setLocalToBeConfirmed(localToBeConfirmed.filter(user => user.userId !== receiverId));
                dispatch(setToBeConfirmed({ toBeConfirmed: localToBeConfirmed }));
            }
            toastRef.current.addToast(response.data.message);

        } catch (error) {
            toastRef.current.addToast(error?.response?.data.message)

        }
    }


    function handleClick() {
        navigate(`/user/profile/${userName}`);
    }
    return (
        <>
            <ToastContainer ref={toastRef} />
            <div className="absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg w-11/12 md:w-1/2 h-[70%]">
                <div className="profile flex flex-col items-start ml-2">
                    <img
                        className="object-cover w-12 h-12 md:h-18 md:w-18 lg:h-24 lg:w-24"
                        src={profile}
                        alt="profile"
                    />
                    <h1 className="text-black lg:text-3xl md:text-2xl text-lg">{userName}</h1>
                    <button onClick={() => handleClick(userName)} className="absolute top-20 right-2 text-sm lg:text-base md:text-base mt-2 text-black items-center px-2 py-1 md:px-4 md:py-2 lg:px-4 lg:py-2 rounded-lg transition-all border">
                        edit profile
                    </button>
                </div>
                <div className="absolute top-[40%] h-fit gap-x-2 gap-y-2 lg:gap-x-2 md:gap-x-2  flex flex-wrap justify-start ml-2">
                    <button
                        onClick={() => handleOpenList("melos")}
                        className="text-black text-sm lg:text-base md:text-base px-2 py-1 md:px-4 md:py-2 lg:px-4 lg:py-2 rounded-lg border"
                    >
                        melos
                    </button>
                    <button
                        onClick={() => handleOpenList("pending melos")}
                        className="text-black text-sm lg:text-base md:text-base px-2 py-1 md:px-4 md:py-2 lg:px-4 lg:py-2 rounded-lg border flex items-center justify-center"
                    >
                        pending melos
                        {localPendingRequestsCount > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs lg:text-sm bg-red-500 text-white rounded-full">
                                {localPendingRequestsCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => handleOpenList("your pending melos")}
                        className="text-black text-sm lg:text-base md:text-base px-2 py-1 md:px-4 md:py-2 lg:px-4 lg:py-2 rounded-lg border"
                    >
                        your pending melos
                    </button>
                    <button
                        onClick={() => handleOpenList("unfav melos")}
                        className="text-black text-sm lg:text-base md:text-base px-2 py-1 md:px-4 md:py-2 lg:px-4 lg:py-2 rounded-lg border"
                    >
                        unfav melos
                    </button>
                </div>
                {activeList && (
                    <>
                        <div
                            ref={listRef}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-fit flex justify-center items-center"
                        >
                            <div className="rounded-lg shadow-lg text-black text-lg p-4 w-full h-full">
                                <h2 className="text-sm md:text-lg lg:text-lg">{activeList}</h2>
                                <div className="list-items mt-2 flex flex-col gap-y-2">
                                    {activeList === "melos" && (
                                        <>
                                            <div className="flex flex-col gap-y-4">
                                                {localFriendList?.length > 0 ? (
                                                    localFriendList.map((user, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between gap-x-3 md:gap-x-6 p-4 border rounded-lg"
                                                        >
                                                            <div
                                                                onClick={() => goToProfile(user.userName)}
                                                                className="cursor-pointer text-xs sm:text-sm md:text-base font-medium"
                                                            >
                                                                {user.userName}
                                                            </div>
                                                            <div className="flex gap-x-3">
                                                                <button
                                                                    onClick={() => removeFriend(user.userId)}
                                                                    className="px-4 py-2 text-xs sm:text-sm md:text-base border rounded-md"
                                                                >
                                                                    remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <h1 className="text-xs sm:text-sm md:text-lg text-black text-center">
                                                        no melos there-
                                                    </h1>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {activeList === "pending melos" && (
                                        <>
                                            <div className="flex flex-col gap-y-4">
                                                {localPendingRequests?.length > 0 ? (
                                                    localPendingRequests.map((user, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between gap-x-3 md:gap-x-6 p-4 border rounded-lg"
                                                        >
                                                            <div
                                                                onClick={() => goToProfile(user.userName)}
                                                                className="cursor-pointer text-xs sm:text-sm md:text-base font-medium"
                                                            >
                                                                {user.userName}
                                                            </div>
                                                            <div className="flex gap-x-3">
                                                                <button
                                                                    onClick={() => acceptFriend(user.userId, user.userName)}
                                                                    className="px-4 py-2 text-xs sm:text-sm md:text-base border rounded-md"
                                                                >
                                                                    accept
                                                                </button>
                                                                <button
                                                                    onClick={() => rejectFriend(user.userId)}
                                                                    className="px-4 py-2 text-xs sm:text-sm md:text-base border rounded-md"
                                                                >
                                                                    reject
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <h1 className="text-xs sm:text-sm md:text-lg text-black text-center">
                                                        no melos there-
                                                    </h1>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {activeList === "your pending melos" && (
                                        <>
                                            <div className="flex flex-col gap-y-4">
                                                {localToBeConfirmed?.length > 0 ? (
                                                    localToBeConfirmed.map((user, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between gap-x-3 md:gap-x-6 p-4 border rounded-lg"
                                                        >
                                                            <div
                                                                onClick={() => goToProfile(user.userName)}
                                                                className="cursor-pointer text-xs sm:text-sm md:text-base font-medium"
                                                            >
                                                                {user.userName}
                                                            </div>
                                                            <div className="flex gap-x-3">
                                                                <button
                                                                    onClick={() => cancelFriendRequest(user.userId)}
                                                                    className="px-4 py-2 text-xs sm:text-sm md:text-base border rounded-md"
                                                                >
                                                                    cancel request
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <h1 className="text-xs sm:text-sm md:text-lg text-black text-center">
                                                        no pending melo request there-
                                                    </h1>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {activeList === "unfav melos" && (
                                        <>
                                            <div className="flex flex-col gap-y-4">
                                                {localBlockedUsers?.length > 0 ? (
                                                    localBlockedUsers.map((user, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between gap-x-3 md:gap-x-6 p-4 border rounded-lg"
                                                        >
                                                            <div
                                                                onClick={() => goToProfile(user.userName)}
                                                                className="cursor-pointer text-xs sm:text-sm md:text-base font-medium"
                                                            >
                                                                {user.userName}
                                                            </div>
                                                            <div className="flex gap-x-3">
                                                                <button
                                                                    onClick={() => unblockUser(user.userId)}
                                                                    className="px-4 py-2 text-xs sm:text-sm md:text-base border rounded-md"
                                                                >
                                                                    unblock
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <h1 className="text-xs sm:text-sm md:text-lg text-black text-center">
                                                        no melos there-
                                                    </h1>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <button onClick={handleLogout} disabled={isLoading} className={` h-fit absolute bottom-0 left-[40%] border text-base px-12 py-2 rounded-lg lg:text-xl md:text-xl items-center ${isLoading ? 'cursor-not-allowed' : ''}`}>logout</button>
            </div>
        </>
    );

}
