import React from "react";
import { useNavigate } from "react-router-dom";

export default function Error() {

  const naviagte = useNavigate()
  function goBack() {
    naviagte('/homepage')
  }

  return (
    <>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-y-4 p-6 rounded-lg bg-[#CCD0CF] shadow-lg md:w-1/2 w-11/12 max-w-lg">
        <h1 className="text-xl font-semibold text-gray-700 text-center">
          calm down traveller, place isn't found yet-
        </h1>
        <button
          className="bg-[#5CC6AB] text-white py-2 px-6 rounded-lg hover:bg-[#4AAE9B] focus:ring-2 focus:ring-[#5CC6AB] focus:outline-none transition-all duration-200"
          onClick={goBack}
        >
          go back?
        </button>
      </div>
    </>

  )
}