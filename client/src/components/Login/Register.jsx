import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { db } from '../../assets/firebaseConfig';
import { collection, where, getDocs, query } from "firebase/firestore"


function Register() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false)
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate()

  async function handleContinue() {
    if (!email || !password) {
      setError('type both email and password')
      return
    }

    if (!isValidEmail(email)) {
      setError('not a valid email')
      return
    }

    const emailExists = await EmailExists(email);
    if (emailExists === null) {
      setError('something went wrong')
      return
    }

    if (emailExists) {  
      setError('email already exists')
      return
    }

    if (password.length < 6) {
      setError('password is length less than 6 characters')
      return
    }
    setError('')
    navigate('/register/intro', { state: { email, password, isAccessible: true } })
  }

  async function EmailExists(email) {
    if (!email) {
      return false
    }
  
    try {
      const userCollection = collection(db, 'users');
      const q = query(userCollection, where('email', '==', email.trim()));
      const querySnap = await getDocs(q);
  
      return !querySnap.empty;
    } catch (error) {
      return null
    }
  }
  

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  return (
    <div className="relative">
  
  <div className="absolute top-0 left-0 cursor-pointer m-1 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transform rotate-90 flex items-center justify-center z-10 text-white sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg">
    merofiru
  </div>

  
  <div className="flex items-center justify-center min-h-screen px-4">
    <div className="bg-[#CCD0CF] p-4 rounded-lg shadow-lg w-full max-w-sm md:max-w-md">
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="text-black p-2 rounded-lg outline outline-1 hover:outline-slate-700 outline-slate-500 w-full placeholder-gray-600 mb-4"
        placeholder="email"
        required
      />
      <div className="relative w-full mb-4">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-black p-2 rounded-lg outline outline-1 hover:outline-slate-700 outline-slate-500 w-full placeholder-gray-600"
          placeholder="password?"
          required
        />
        <span
          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </span>
      </div>
      <button
        onClick={handleContinue}
        className={`text-white py-2 px-4 rounded-lg w-full ${
          email.length > 0 && password.length > 0
            ? "cursor-pointer bg-[#5cc6abeb]"
            : "cursor-not-allowed bg-[#4087762e]"
        } transition-all`}
        disabled={!email.length || !password.length}
      >
        continue
      </button>
    </div>
  </div>

  
  <div className="absolute bottom-0 right-0 m-1 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transform -rotate-90 flex items-center justify-center z-10 text-white text-sm sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg">
    hello stranger
  </div>
</div>

  );
}

export default Register;


