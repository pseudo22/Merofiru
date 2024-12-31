import React, { useState , useRef} from 'react';
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

      const response = await signInWithEmailAndPassword(auth , email , password).then((res)=>{
        console.log(res);
        
      }).catch((err)=>{

        console.log(err);
      })
    

      toastRef.current.addToast(response?.data.message)
      navigate('/homepage')

    } catch (error) {
      toastRef.current.addToast(error.response?.data.errors)
    }
  };

  return (
    <>
      <ToastContainer
        ref={toastRef}
      />

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
          <button className='bg-[#5cc6abeb] text-white py-2 px-4 rounded-lg hover:outline-slate-700 outline-slate-500 w-full mt-4 transition-all' type="submit">login</button>
        </div>
      </form>
    </>
  );
};

export default LoginPage;


// TODO: what to do after login??
