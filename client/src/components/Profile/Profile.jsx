import { useRef, useState, useEffect } from "react";
import { ApiClient } from '../../assets/axios.js';
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import ToastContainer from "../Toast/ToastContainer.jsx";
import addfriend from '../../images/addfriend.png';
import alreadyfriends from '../../images/friends.png';
import block from '../../images/block.png';
import pending from '../../images/pending.png';
import { setToBeConfirmed, setBlockedUsers } from '../../features/userSlice.js';


export default function Profile({ canUpdate, presence, pfp, userName, bio, genres, searchedUserId }) {



    const { toBeConfirmed } = useSelector((state) => state.user);
    const { friends } = useSelector((state) => state.friends);
    const { blockedUsers } = useSelector((state) => state.user)

    const [localtobecomfirmed, setLocalToBeConfirmed] = useState(toBeConfirmed)
    const [localfriends, setLocalFriends] = useState(friends)
    const [localblockedUsers, setLocalBlockedUsers] = useState(blockedUsers)

    const [isEditing, setIsEditing] = useState(false);
    const [updatedBio, setUpdatedBio] = useState(bio);
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentPresence, setCurrentPresence] = useState(presence);
    const [isFriends, setIsFriends] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false)

    const toastRef = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userId = useSelector((state) => state.user.userId);
    const loginName = useSelector((state) => state.user.userName);

    useEffect(() => {
        setIsPending(localtobecomfirmed?.some(user => user.userId === searchedUserId));
        setIsFriends(localfriends?.some(friend => friend.userId === searchedUserId));
        setIsBlocked(localblockedUsers?.some(user => user.userId === searchedUserId));


        if (loginName === userName) {
            setCurrentPresence(true);
        } else {
            setCurrentPresence(presence);
        }
    }, [localtobecomfirmed, localfriends, localblockedUsers, searchedUserId, loginName, userName, presence]);


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleSave = async () => {
        try {
            if (!updatedBio && !selectedFile) {
                return toastRef.current.addToast('Nothing to update!');
            }

            const formData = new FormData();
            formData.append("bio", updatedBio);
            if (selectedFile) {
                formData.append("profilePicture", selectedFile);
            }
            formData.append('userId', userId);

            const response = await ApiClient.post("/api/user/update", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                toastRef.current.addToast(response.data.message);
            } else {
                console.error("Profile update failed:", response.data.message);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    function handleCancel() {
        setIsEditing(false);
    }

    function handleNavigation() {
        navigate('/user/genre');
    }


    async function blockUser(searchedUserId) {
        try {
            const res = await ApiClient.post('/api/user/block-user', {
                userId: userId,
                toBeBlockedId: searchedUserId,
                userName: loginName,
                toBeBlockedName: userName
            });

            if (res.data.success) {
                toastRef.current.addToast(res.data.message);
                setLocalBlockedUsers([...localblockedUsers, { userId: searchedUserId, userName: userName }]);
                dispatch(setBlockedUsers([...localblockedUsers, { userId: searchedUserId, userName: userName }]));
            }

        } catch (error) {
            toastRef.current.addToast(error?.response?.data.message);

        }

    }

    async function addFriend(searchedUserId) {
        try {
            const res = await ApiClient.post('/api/user/send-friend-request', {
                senderId: userId,
                receiverId: searchedUserId,
                senderName: loginName,
                receiverName: userName
            });

            if (res.data.success) {
                toastRef.current.addToast(res.data.message);
                setLocalToBeConfirmed([...localtobecomfirmed, { userId: searchedUserId, userName: userName }]);
                dispatch(setToBeConfirmed([...localtobecomfirmed, { userId: searchedUserId, userName: userName }]));
            }

        } catch (error) {
            toastRef.current.addToast(error?.response?.data.message);
        }
    }



    return (
        <>
            <ToastContainer ref={toastRef} />
            <div className="absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#CCD0CF] shadow-lg w-full h-[60%] md:w-[50%] md:h-full">
                {isEditing ? (
                    <>
                        <div className="edit-view gap-y-2 top-12 relative flex flex-col items-center mt-5 h-[80%] w-full">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mb-2"
                                placeholder="change the pixels"
                            />
                            <textarea
                                value={updatedBio}
                                onChange={(e) => setUpdatedBio(e.target.value)}
                                className="p-2 w-[80%] h-[30%] border rounded-md"
                                placeholder="so what will be the new one?"
                            />
                            <div className="flex gap-4 justify-between w-[40%] h-[30%]">
                                <button
                                    onClick={handleSave}
                                    className="bg-[#5cc6abeb] text-white p-2 rounded-md w-[60%] h-[40%] md:h-[20%]"
                                >
                                    save!!
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="bg-[#5cc6abeb] text-white px-2 rounded-md w-[60%] h-[60%] md:h-[20%]"
                                >
                                    not sure?
                                </button>
                            </div>
                            <button
                                onClick={handleNavigation}
                                className="bg-[#5cc6abeb] text-white p-2 rounded-md w-[30%] h-[10%] md:h-[8%] mt-4"
                            >
                                edit genres
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="profile-view relative flex flex-col items-center mt-5 h-[90%] w-full">
                            <p className="absolute top-32 left-0 text-2xl md:text-4xl lg:text-4xl md:top-32">{userName}</p>
                            <div className="absolute right-0">
                                <img src={pfp} className="relative w-32 h-32 rounded-full" alt="profile" />
                                {currentPresence ? (
                                    <div
                                        title="online"
                                        className="relative left-[70%] bottom-5 bg-green-500 h-4 w-4 rounded-full"
                                    ></div>
                                ) : (
                                    <div
                                        title="offline"
                                        className="relative left-[70%] bottom-5 bg-gray-500 h-4 w-4 rounded-full"
                                    ></div>
                                )}
                                {!canUpdate && (
                                    <div className="flex flex-row gap-6 mt-5">
                                        {isBlocked ? (
                                            <p className="text-red-500 font-bold">mero is blocked</p>
                                        ) : isFriends ? (
                                            <img className="cursor-pointer"
                                                height={30}
                                                width={30}
                                                src={alreadyfriends}
                                                alt="friends"
                                                title="friends" />

                                        ) : isPending ? (
                                            <img
                                                className="cursor-pointer"
                                                height={20}
                                                width={30}
                                                src={pending}
                                                alt="pending request"
                                                title="pending request"
                                            />
                                        ) : (
                                            <img
                                                className="cursor-pointer"
                                                title="add friend"
                                                height={20}
                                                width={30}
                                                onClick={() => addFriend(searchedUserId)}
                                                src={addfriend}
                                                alt="add friend"
                                            />
                                        )}

                                        {isBlocked ? null : (
                                            <img
                                                className="cursor-pointer"
                                                height={20}
                                                width={30}
                                                src={block}
                                                onClick={() => blockUser(searchedUserId)}
                                                alt="block"
                                                title="block"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                            {canUpdate ? (
                                <p className="absolute top-48 left-0 text-lg md:text-2xl lg:text-2xl md:top-72">
                                    you define yourself as <br /><span className="font-medium">{bio}</span>
                                </p>
                            ) : (
                                <p className="absolute top-48 left-0 text-lg md:text-2xl lg:text-2xl">
                                    merofiru is <br /> <span className="font-medium">{bio}</span>
                                </p>
                            )}
                            <div className="absolute top-[70%]">
                                <h2 className="text-xl md:text-3xl lg:text-3xl mt-6">personality spectrum</h2>
                                <div className="flex flex-wrap gap-x-5 mt-3">
                                    {genres.map((genre, id) => (
                                        <span
                                            key={id}
                                            style={{ color: genre.color }}
                                            className=" rounded-md text-lg md:text-xl lg:text-xl font-medium"
                                        >
                                            {genre.description}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {canUpdate && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-[#5cc6abeb] absolute top-1/2 right-0 mr-2 text-white p-2 rounded-md"
                                >
                                    edit profile
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>

    );
}
