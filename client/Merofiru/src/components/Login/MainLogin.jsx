import React, { useState } from 'react';
import {auth} from '../../assets/firebaseConfig.js'
import { ApiClient } from '../../assets/axios.js';
import { signInAnonymously } from 'firebase/auth';

const Login = () => {

  const [email , setEmail] = useState('')
  const[password , setPassword] = useState('')

  const handleSubmit = async(e) => {
    e.preventDefault()


  }
  const handleRegister = async(e) => {
    e.preventDefault()

  }
  const handleAnonymous = async(e) => {
    e.preventDefault()
    try {

      const userCredential = await signInAnonymously(auth)
      console.log('anonymous login with credential',userCredential);
      
    } catch (error) {
      console.log('error while logging anonymously' ,error);
    }
  }
  

  return (
    <>
  <div className="main relative h-screen flex justify-center items-center">
    <h1 className='text-4xl whitespace-nowrap absolute bg-black -left-10 px-5 py-5 text-white top-[15%] -rotate-90 font-thin'>Merofiru</h1>
    <div className="login text-white absolute top-[30%] flex flex-col justify-center items-center gap-6">
      <input type="text" className='text-black rounded-lg px-3 py-3 outline outline-1 hover:outline-indigo-700 outline-indigo-300' name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='enter your email' required />
      <input type="password" className='text-black rounded-lg px-3 py-3 outline outline-1 hover:outline-indigo-700 outline-indigo-300 ' name='password' value={password} placeholder='enter your password'onChange={(e) => setPassword(e.target.value)} required />
      <button className='text-lg bg-[#c049ce40] hover:bg-[#c049ce80] rounded-lg px-10 py-4' onClick={handleSubmit}>login</button>
      <p></p>
      <button className='text-lg bg-[#c049ce40] hover:bg-[#c049ce80] rounded-lg px-8 py-4' onClick={handleRegister}>dont have an account?</button>
      <p className='text-black'>or</p>
      <button className='text-lg bg-[#c049ce40] hover:bg-[#c049ce80] rounded-lg px-2 py-4' onClick={{}}>use anonymously</button>
    </div>
    <h1 className='text-4xl absolute whitespace-nowrap top-[80%] font-thin text-white -right-20 bg-black px-4 py-4 rotate-90'>Hello Stranger</h1>
  </div>
</>

  )
}

export default Login;
