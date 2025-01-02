import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useAuth from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom';
import profile from '../../images/profile.png'
import match from '../../images/match.png'
import chat from '../../images/chat.png'



export default function Layout({ children }) {



    const { loading } = useAuth()
    const navigate = useNavigate()

    const { userName } = useSelector((state) => state.user);
    const { pendingRequestsCount } = useSelector((state) => state.user)

    const [localPendingRequestCount, setLocalPendingRequestCount] = useState(pendingRequestsCount || 0)


    useEffect(() => {
        setLocalPendingRequestCount(localPendingRequestCount)

    }, [localPendingRequestCount , pendingRequestsCount])

    function navigateToHome() {
        navigate('/homepage')
    }

    function navigateToChat() {
        navigate('/chatlist')
    }
    function navigateToProfile() {
        navigate('/user/settings')
    }

    function navigateToPeopleMatching() {
        navigate('/user/genre-matching')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span>Loading...</span>
            </div>
        );
    }

    return (
        <>

            <div className="nav flex gap-4 mx-2 mt-2 absolute right-0">
                <img
                    onClick={navigateToChat}
                    className="cursor-pointer h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20"
                    title="chat"
                    src={chat}
                    alt="chat"
                />
                <img
                    onClick={navigateToPeopleMatching}
                    className="cursor-pointer h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20"
                    title="match"
                    src={match}
                    alt="match"
                />
                <div className="relative">
                    <img
                        onClick={navigateToProfile}
                        className="cursor-pointer h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20"
                        title="profile"
                        src={profile}
                        alt="profile"
                    />
                    {pendingRequestsCount > 0 && (
                        <span className="absolute top-2 right-3 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                            {pendingRequestsCount}
                        </span>
                    )}
                </div>
            </div>

            <div
                onClick={navigateToHome}
                className="top-left cursor-pointer m-1 absolute top-0 left-0 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transform rotate-90 flex items-center justify-center z-50 text-white text-sm sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg"
            >
                merofiru
            </div>

            <div>{children}</div>

            <div
                className="bottom-right p-2 lg:m-1 md:m-1 absolute bottom-0 right-0 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transform -rotate-90 flex items-center justify-center z-50 text-white text-sm sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg"
            >
                hello {userName}
            </div>


        </>

    );
}
