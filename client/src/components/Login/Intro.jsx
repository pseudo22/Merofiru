
import React, { useEffect, useRef } from "react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ApiClient } from "../../assets/axios"
import p1 from '../../images/default.jpg'
import { db } from "../../assets/firebaseConfig"
import ToastContainer from "../Toast/ToastContainer"
import { collection, where, getDocs, query } from "firebase/firestore"
import CryptoJS from 'crypto-js'

export default function Intro() {



  const location = useLocation()
  const navigate = useNavigate()
  const toastRef = useRef()
  const [isAccessible, setIsAccessible] = useState(location.state?.isAccessible)

  useEffect(() => {
    setIsAccessible(location.state?.isAccessible || false)
  }, [location.state])

  function handleBack() {
    setIsAccessible(false)
    navigate("/register", { state: { isAccessible: false } })
  }

  const [bio, setBio] = useState('');
  const [pfp, setPfp] = useState(p1);
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true)
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false)



  useEffect(() => {

    const checkAvail = async () => {
      if (username) {
        try {
          const userCollection = collection(db, 'users')

          const q = query(userCollection, where('displayName', '==', username.trim()))

          const querySnap = await getDocs(q)
          setIsUsernameAvailable(querySnap.empty)
        } catch (error) {
          console.log(error)
          setIsUsernameAvailable(false)
        }
      } else {
        setIsUsernameAvailable(true)
      }
    }


    const timer = setTimeout(checkAvail, 500)
    return () => clearTimeout(timer)
  }, [username])

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPfp(reader.result);
      };
      reader.readAsDataURL(file);
      setFile(file);
    }
  };

  const submitImage = () => {
    document.getElementById('pfp').click();
  };


  const getDatafromForm = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      const formData = new FormData();
      const email = location.state?.email
      const password = location.state?.password
      if (email && password) {
        formData.append('email', email);
        formData.append('password', password)
      } else {
        toast.error('email or password missing')
      }
      formData.append('displayName', username);
      formData.append('bio', bio);
      if (file) {
        formData.append('profilePicture', file);
      } else {
        formData.append('profilePicture', p1);
      }

      await ApiClient.post('/api/user/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toastRef.current.addToast('ready to login?')
      setRegistered(true);

      setTimeout(() => {
        navigate('/login');
        setLoading(false)
      }, 2000);

    } catch (error) {
      console.log(error);

      toastRef.current.addToast(error.response?.data.message)
      setLoading(false)
    }
  };

  if (!isAccessible) {
    return (
      <>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-2 items-center gap-y-4 p-4 flex flex-col rounded-lg bg-[#CCD0CF] shadow-lg md:w-auto w-full h-auto">
          appreciate the excitement, but please first complete the registration process.
          <button
            className="bg-[#5cc6abeb] text-white py-2 px-4 rounded-lg hover:outline-slate-700 outline-slate-500 w-full mt-4 transition-all"
            onClick={handleBack}
          >
            Back to Register
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer
        ref={toastRef}
      />

      {!isAccessible && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-2 items-center gap-y-4 p-4 flex flex-col rounded-lg bg-[#CCD0CF] shadow-lg md:w-64 w-full h-auto">
          appreciate the excitement, but please first complete the registration process.
          <button
            className="bg-[#5cc6abeb] text-white py-2 px-4 rounded-lg hover:outline-slate-700 outline-slate-500 w-full mt-4 transition-all"
            onClick={handleBack}
          >
            back to Register
          </button>
        </div>
      )}

      {isAccessible && (
        <>

          <div className="absolute top-0 left-0 cursor-pointer m-1 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transform rotate-90 flex items-center justify-center z-10 text-white sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg">
            merofiru
          </div>


          <div className="flex items-center justify-center min-h-screen px-4">
            <form onSubmit={getDatafromForm} className="w-full max-w-sm md:max-w-md bg-[#CCD0CF] p-4 rounded-lg shadow-lg">

              <div className="flex justify-center mb-4">
                <img
                  src={pfp}
                  alt="Profile Picture"
                  className="w-20 h-20 object-contain rounded-full"
                />
              </div>


              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-black p-2 rounded-lg outline outline-1 hover:outline-slate-700 outline-slate-500 w-full placeholder-gray-600 mb-4"
                placeholder="what would you like to be called?"
                required
              />
              {!isUsernameAvailable && username ? (
                <p className="text-red-500 text-sm mb-2">merofiru already exists</p>
              ) : username && isUsernameAvailable ? (
                <p className="text-green-500 text-sm mb-2">merofiruuuu</p>
              ) : null}


              <textarea
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="text-black p-2 rounded-lg outline outline-1 hover:outline-slate-700 outline-slate-500 w-full placeholder-gray-600 resize-none mb-4"
                placeholder="which phrase describes you best?"
                rows="4"
              />


              <input
                id="pfp"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={submitImage}
                className="text-black rounded-lg outline outline-1 px-4 py-2 hover:bg-[#ccd0cf] transition-all mb-4 w-full"
              >
                what defines you in pixels?
              </button>


              <button
                type="submit"
                disabled={!isUsernameAvailable || username.length === 0 || bio.length === 0 || loading}
                className={`py-2 px-4 rounded-lg w-full transition-all ${loading || (isUsernameAvailable && username.length > 0 && bio.length > 0)
                    ? "bg-[#5cc6abeb] hover:outline-slate-700 outline-slate-500"
                    : "bg-[#5cc6ab68] cursor-not-allowed"
                  }`}
              >
                {registered ? "registered" : loading ? "registering..." : "complete!!"}
              </button>
          </form>
        </div>


      <div className="absolute bottom-0 right-0 m-1 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transform -rotate-90 flex items-center justify-center z-10 text-white text-sm sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg">
        hello stranger
      </div>
    </>

  )
}
    </>
  );
}
