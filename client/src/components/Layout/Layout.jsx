import React from 'react';
import {useSelector } from 'react-redux';
import useAuth from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom';

// TODO: fix the state for auth, logout

export default function Layout({ children }) {
    
    const {loading} = useAuth()
    const navigate = useNavigate()
    const { userName } = useSelector((state) => state.user);


    function navigateToHome(){
        navigate('/homepage')
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
            <div onClick={navigateToHome} className="top-left cursor-pointer m-1 absolute top-0 left-0 bg-[#5cc6abeb] w-20 h-20 text-lg md:w-36 md:h-36 transform rotate-90 flex items-center justify-center z-999 text-white md:font-bold md:text-2xl rounded-lg shadow-lg">
                merofiru
            </div>
            <div>{children}</div>
            <div className="bottom-right m-1 absolute bottom-0 right-0 bg-[#5cc6abeb] w-20 h-20 text-lg -rotate-90 px-6 md:w-36 md:h-36 flex items-center justify-center md:text-3xl text-white md:font-bold rounded-lg shadow-lg">
                hello {userName}
            </div>
        </>
    );
}
