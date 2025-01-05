import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useAuth from '../../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom';
import upprof from '../../images/upprof.png'
import upgenre from '../../images/upgenre.png'
import upchat from '../../images/upchat.png'
import { auth } from '../../assets/firebaseConfig';

export default function Layout({ children }) {
    const { loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const {userName} = useSelector((state) => state.user)
    const { pendingRequestsCount } = useSelector((state) => state.user);
    const [localPendingRequestCount, setLocalPendingRequestCount] = useState(pendingRequestsCount || 0);
    const [currentParams, setCurrentParams] = useState('');

    const pathMap = [
        { path: '/chatlist', label: 'chat' },
        {path : '/chat/.*' , label : 'chat'},
        { path: '/user/settings', label: 'profile settings' },
        { path: '/user/profile/.*', label: 'profile' },
        {path : '/user/genre-matching' , label : 'find matches'}
    ];

    useEffect(() => {
        setLocalPendingRequestCount(localPendingRequestCount);
    }, [localPendingRequestCount, pendingRequestsCount]);

    useEffect(() => {
        const matched = pathMap.find((item) => new RegExp(item.path).test(location.pathname));
        setCurrentParams(matched ? matched.label : '');
    }, [location.pathname]);

    function navigateToHome() {
        navigate('/homepage');
    }

    function navigateToChat() {
        navigate('/chatlist');
    }

    function navigateToProfile() {
        navigate('/user/settings');
    }

    function navigateToPeopleMatching() {
        navigate('/user/genre-matching');
    }

    function goBack() {
        navigate('/login');
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span>Loading...</span>
            </div>
        );
    }

    if (!auth.currentUser) {
        return (
            <>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-y-4 p-6 rounded-lg bg-[#CCD0CF] shadow-lg md:w-1/2 w-11/12 max-w-lg">
                    <h1 className="text-xl font-semibold text-gray-700 text-center">
                        care to login?
                    </h1>
                    <button
                        className="bg-[#5CC6AB] text-white py-2 px-6 rounded-lg hover:bg-[#4AAE9B] focus:ring-2 focus:ring-[#5CC6AB] focus:outline-none transition-all duration-200"
                        onClick={goBack}
                    >
                        login!!
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <div
                onClick={navigateToHome}
                className="top-left cursor-pointer m-1 absolute top-0 left-0 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-32 lg:h-32 transform rotate-90 flex items-center justify-center z-50 text-white text-sm sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg"
            >
                merofiru
            </div>

            <div className="nav absolute right-0 z-999 flex md:flex-col lg:flex-row gap-2 mr-2">
                <img
                    onClick={navigateToChat}
                    className="cursor-pointer h-10 w-10 sm:h-12 sm:w-12 md:h-12 md:w-12 lg:h-16 lg:w-16"
                    title="chat"
                    src={upchat}
                    alt="chat"
                />
                <img
                    onClick={navigateToPeopleMatching}
                    className="cursor-pointer h-10 w-10 sm:h-12 sm:w-12 md:h-12 md:w-12 lg:h-16 lg:w-16"
                    title="match"
                    src={upgenre}
                    alt="match"
                />
                <div className="relative">
                    <img
                        onClick={navigateToProfile}
                        className="cursor-pointer h-10 w-10 sm:h-12 sm:w-12 md:h-12 md:w-12 lg:h-16 lg:w-16"
                        title="profile"
                        src={upprof}
                        alt="profile"
                    />
                    {pendingRequestsCount > 0 && (
                        <span className="absolute top-2 right-3 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                            {pendingRequestsCount}
                        </span>
                    )}
                </div>
            </div>

            <div>
                {children}
            </div>

            <div
                className="bottom-right p-2 absolute bottom-0 right-0 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-32 lg:h-32 transform -rotate-90 flex items-center justify-center z-50 text-white text-sm sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg"
            >
                {currentParams ? currentParams : `hello ${userName}`}
            </div>
        </>
    );
}
