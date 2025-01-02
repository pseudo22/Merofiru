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

  const navigate = useNavigate()
  const toastRef = useRef()

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const response = await signInWithEmailAndPassword(auth, email, password)
      
      .then(()=>{
        toastRef.current.addToast('welcome merofiru')
        
      setTimeout(() => {
        navigate('/homepage')
      } , 1000)
        
      })
      
      .catch(() => {
      toastRef.current.addToast('problem while login')

      })

    } catch (error) {
      toastRef.current.addToast('problem while login')
    }
  };

  return (
    <>
      <ToastContainer
        ref={toastRef}
      />
      <div className="top-left cursor-pointer m-1 absolute top-0 left-0 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transform rotate-90 flex items-center justify-center z-999 text-white sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg">
        merofiru
      </div>

      <div>
      <form onSubmit={handleSubmit}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-2 items-center gap-y-4 p-4 flex flex-col rounded-lg bg-[#CCD0CF] shadow-lg md:w-96 w-full h-auto">
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-black p-2 rounded-lg outline outline-1 hover:outline-slate-700 outline-slate-500 w-full placeholder-gray-600"
            placeholder="email"
            required
          />
          <div className="relative w-full">
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
          <button className={` text-white py-2 px-4 rounded-lg w-full ${email.length > 0 && password.length > 0 ? 'cursor-pointer bg-[#5cc6abeb]' : 'cursor-not-allowed bg-[#4087762e]'} mt-4 transition-all`} disabled={!email.length > 0 && !password.length > 0} type="submit">login</button>
        </div>
      </form>
      <div>
        <button
          className='absolute top-[70%] md:top-[65%] lg:top-[65%] left-[50%] lg:left-[50%] md:left-[52%] transform -translate-x-1/2 -translate-y-1/2 bg-[#5cc6abeb] text-white py-2 px-4 rounded-lg mt-4 transition-all'
          onClick={() => navigate('/register')}
        >
          new in town?
        </button>
      </div>
      </div>
      
      <div
            className="bottom-right m-1 absolute bottom-0 right-0 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transform -rotate-90 flex items-center justify-center p-4 z-50 text-white text-sm sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg"
        >
        hello stranger
      </div>
    </>
  );
};

export default LoginPage;





