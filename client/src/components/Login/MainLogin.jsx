import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../assets/firebaseConfig.js';
import ToastContainer from '../Toast/ToastContainer.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()
  const toastRef = useRef()

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      setLoading(true)
      const response = await signInWithEmailAndPassword(auth, email, password)

        .then(() => {
          setLoading(false)
          setSuccess(true)
          toastRef.current.addToast('welcome merofiru')

          setTimeout(() => {
            navigate('/homepage')
          }, 2000)

        })

        .catch((rej) => {
          setLoading(false)
          setSuccess(false)
          toastRef.current.addToast('invalid credentials')

        })

    } catch (error) {
      setLoading(false)
      setSuccess(false)
      toastRef.current.addToast('problem while login')
    }
  };

  return (
    <>
      <ToastContainer
        ref={toastRef}
      />
      <div className="relative">

        <div className="absolute top-0 left-0 cursor-pointer m-1 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transform rotate-90 flex items-center justify-center z-10 text-white sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg">
          merofiru
        </div>


        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[#CCD0CF] p-4 rounded-lg shadow-lg w-full max-w-sm md:max-w-md"
          >
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
              className={`text-white py-2 px-4 rounded-lg w-full transition-all ${!email.length || !password.length || loading || success
                  ? "cursor-not-allowed bg-[#4087762e]"
                  : "cursor-pointer bg-[#5cc6abeb]" 
                }`}
              disabled={!email.length || !password.length || loading || success}
              type="submit"
            >
              {loading ? 'setting up things' : success ? 'loggin you in' : 'login'}
            </button>
          </form>


          <button
            className="bg-[#5cc6abeb] text-white py-2 px-4 rounded-lg mt-4 transition-all"
            onClick={() => navigate("/register")}
          >
            new in town?
          </button>
        </div>


        <div className="absolute bottom-0 right-0 m-1 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transform -rotate-90 flex items-center justify-center z-10 text-white text-sm sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg">
          hello stranger
        </div>
      </div>

    </>
  );
};

export default LoginPage;





