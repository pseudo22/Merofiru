import React, { useState } from 'react';
import {auth} from '../assets/firebaseConfig.js'

const Login = () => {

  const [email , setEmail] = useState('')

  return (
    <>
    <div className='w-full h-screen bg-[#B3C8CF]'>
      <div className="left absolute bg-red-300  left-0 w-1/2 h-screen">
        <div className="login relative text-5xl font-extralight m-3 top-1/4 left-1/3">
          Login
        </div>
        <div className="entries relative">
            <input type="email"
            placeholder='Enter Your Email'
            value={email}
            onc
            />
          </div>
      </div>
      <div className="right absolute right-0 w-1/2 h-screen"></div>
    </div>
    </>
  )
}

export default Login;
