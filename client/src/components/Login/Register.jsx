import React, {useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Register() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()

  function handleContinue() {
    if (!email || !password) {
      setError('type both email and password')
      return
    }

    if (!isValidEmail(email)) {
      setError('not a valid email')
      return
    }
    if (password.length < 6) {
      setError('password is length less than 6 characters')
      return
    }
    setError('')
    navigate('/register/intro', { state: { email, password, isAccessible: true } })
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  return (
    <>
      <div className="top-left cursor-pointer m-1 absolute top-0 left-0 bg-[#5cc6abeb] w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 transform rotate-90 flex items-center justify-center z-999 text-white sm:text-lg md:text-2xl lg:text-3xl rounded-lg shadow-lg">
        merofiru
      </div>

      <div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-2 items-center gap-y-4 p-4 flex flex-col rounded-lg bg-[#CCD0CF] shadow-lg md:w-96 w-full h-auto">
        {error && <p className="text-red-500">{error}</p>}

        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-black p-2 rounded-lg outline outline-1 hover:outline-slate-700 outline-slate-500 w-full placeholder-gray-600"
          placeholder="email"
          required
        />
        <div className=" w-full">
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
            className="absolute top-[40%] right-[5%] text-gray-600 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
        </div>
        <button
          onClick={handleContinue}
          className={`text-white py-2 px-4 rounded-lg w-full ${email.length > 0 && password.length > 0 ? 'cursor-pointer bg-[#5cc6abeb]' : 'cursor-not-allowed bg-[#4087762e]'} mt-4 transition-all`}
          disabled={!email.length > 0 && !password.length > 0}
        >
          continue
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
}

export default Register;


