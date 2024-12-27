import { useRef, useState } from "react";
import { ApiClient } from '../../assets/axios.js'
import { useNavigate } from "react-router-dom";
import {useSelector} from 'react-redux';
import ToastContainer from "../Toast/ToastContainer.jsx";

export default function Profile({ canUpdate, pfp, userName, bio, genres }) {
    const [isEditing, setIsEditing] = useState(false);
    const [updatedBio, setUpdatedBio] = useState(bio);
    const [selectedFile, setSelectedFile] = useState(null);

    const toastRef = useRef()

    const navigate = useNavigate()
    const userId = useSelector((state) => state.user.userId)


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleSave = async () => {
        try {

            if(!updatedBio && !selectedFile){
                return toastRef.current.addToast('nothing to update-')
            }

            const formData = new FormData();
            formData.append("bio", updatedBio)
            if (selectedFile) {
                formData.append("profilePicture", selectedFile);
            }
            formData.append('userId' , userId)

            const response = await ApiClient.post("/api/user/update", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                toastRef.current.addToast(response.data.message)
            } else {
                console.error("Profile update failed:", response.data.message);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    function handleCancel() {
        setIsEditing(false)
    }

    function handleNavigation() {
        navigate('/user/genre')
    }


    return (
        <>
        <ToastContainer ref={toastRef}/>
        <div className="absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#CCD0CF] shadow-lg md:w-[30%] md:h-full w-full h-[60%] ">
            {isEditing ? (
                <>
                    <div className="edit-view gap-y-2  top-12 relative h-[80%] mt-5 items-center w-full flex flex-col">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mb-2"
                            placeholder="change the pixels"
                        />
                        <textarea
                            value={updatedBio}
                            onChange={(e) => setUpdatedBio(e.target.value)}
                            className="p-2 w-[80%] h-[30%]  border rounded-md"
                            placeholder="so what will be the new one?"
                        />
                        <div className="flex gap-4 justify-between h-[30%] w-[40%]">
                            <button
                                onClick={handleSave}
                                className="bg-[#5cc6abeb] text-white p-2 rounded-md w-[60%] h-[40%] md:h-[20%]"
                            >
                                save!!
                            </button>
                            <button
                                onClick={handleCancel}
                                className="bg-[#5cc6abeb] text-white p-2 rounded-md w-[60%] h-[40%] md:h-[20%]"
                            >
                                not sure?
                            </button>
                        </div>
                        <button
                            onClick={handleNavigation}
                            className="bg-[#5cc6abeb] text-white p-2 rounded-md w-[30%] h-[10%] md:h-[8%] mt-4"
                        >
                            edit genres
                        </button>

                    </div>
                </>
            ) : (
                <>
                    <div className="profile-view relative h-[90%] mt-5 items-center w-full flex flex-col">
                        <p className="absolute text-4xl top-32 md:top-32 left-0">{userName}</p><img src={pfp} className="w-32 right-4 absolute h-32 rounded-full" alt="profile" />
                        {canUpdate ? <p className="absolute text-2xl top-48 md:top-72 left-0">you define yourself as <br /> {bio} </p> : <p className="absolute text-2xl top-48 left-0">melophile is <br /> {bio}</p>}
                        <div className="absolute top-[70%]">
                            <h2 className="text-3xl mb-4">personality spectrum</h2>
                            <div className="flex flex-wrap gap-2">
                                {genres.map((genre, id) => (
                                    <span key={id} style={{ color: genre.color }} className=" rounded-md px-2 py-1 text-xl font-medium">
                                        {genre.description}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {canUpdate && (
                            <button onClick={() => setIsEditing(true)} className="bg-[#5cc6abeb] absolute bottom-0 text-white p-2 rounded-md">
                                Edit Profile
                            </button>
                        )}

                    </div>
                </>
            )}
        </div>
        </>
    );
}
