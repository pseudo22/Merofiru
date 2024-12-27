import React, { useState } from 'react';
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
        <button
          onClick={handleContinue}
          className="bg-[#5cc6abeb] text-white py-2 px-4 rounded-lg hover:outline-slate-700 outline-slate-500 w-full mt-4 transition-all"
        >
          continue
        </button>
      </div>

    </>
  );
}

export default Register;










// const dispatch = useDispatch();
// const userStatus = useSelector((state) => state.user.status);
// const userError = useSelector((state) => state.user.error);
// // const navigate = useNavigate();








{/* <form onSubmit={getDatafromForm}>
      <div className='register relative h-[90vh] flex flex-col items-center justify-center gap-6'>
        {error && <div className='error-message text-red-500'>{error}</div>}
        {userError && <div className='error-message text-red-500'>{userError}</div>}
        {userStatus === 'loading' && <div className='loading-message'>Registering...</div>}
        
        
        <input
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='text-black rounded-lg outline outline-1 hover:outline-indigo-800 outline-indigo-500'
          placeholder='Enter your username'
          required
        />
        <textarea
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className='text-black rounded-lg outline outline-1 hover:outline-indigo-800 outline-indigo-500 resize-none'
          placeholder='Bio'
          rows="4"
        />
        <input
          id='pfp'
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleFileChange}
        />
        <button
          type='button'
          onClick={submitImage}
          className='text-[#112ab6cb] rounded-full outline outline-1 px-3 py-5'
        >
          Upload what defines you
        </button>
        <button
          type='submit'
          className='text-[#112ab6cb] rounded-full outline outline-1 px-12 py-3'
        >
          Next
        </button>
      </div>
    </form> */}