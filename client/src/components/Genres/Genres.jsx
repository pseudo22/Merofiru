import React, { useEffect, useState, useRef } from 'react';
import { ApiClient } from '../../assets/axios';
import { db } from '../../assets/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ToastContainer from '../Toast/ToastContainer';
import { setUserGenres } from '../../features/userSlice';

function Genres() {
    const navigate = useNavigate();
    const { selectedGenres } = useSelector((state) => state.user);
    const {userId} = useSelector((state) => state.user)
    const [genres, setGenres] = useState([]);
    const [localSelectedGenres, setLocalSelectedGenres] = useState(selectedGenres)
    const [loading, setLoading] = useState(false);
    const [navigating, setNavigating] = useState(false);


    const dispatch = useDispatch()
    const toastRef = useRef()

    useEffect(() => {
        async function fetchGenres() {
            try {

                const genresCollection = collection(db, 'genres');
                const genresSnap = await getDocs(genresCollection);
                const allGenres = genresSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setGenres(allGenres);

            } catch (error) {
                console.error('Error fetching genres', error);
            }
        }
        fetchGenres();
    }, []);


    const genreSelected = (genre) => {
        
        setLocalSelectedGenres((prevSelectedGenres) => {
            const isSelected = prevSelectedGenres?.some((g) => g.id === genre.id);
            return isSelected
                ? prevSelectedGenres?.filter((g) => g.id !== genre.id)
                : [...prevSelectedGenres, genre];
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        if (!localSelectedGenres.length) {
            toastRef.current.addToast('Please select at least one genre!');
            return;
        }

        try {
            const response = await ApiClient.post('/api/genre/update', {
                userId: userId,
                selectedGenres:localSelectedGenres,
            });

            if (JSON.stringify(localSelectedGenres) !== JSON.stringify(selectedGenres)) {
                dispatch(setUserGenres({ selectedGenres: localSelectedGenres }));
            }else{
                toastRef.current.addToast('nothing changed');
            }

            toastRef.current.addToast('genres updated!!');

            setTimeout(() => {
                navigate('/user/genre-matching');
                setNavigating(true);
            }, 2000);
            setLoading(false);
        } catch (error) {
            console.error('Error submitting genres:', error);
            toastRef.current.addToast('Something went wrong');
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer
                ref={toastRef}
            />
            <div className="absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#CCD0CF] shadow-lg md:w-[50%] w-full h-auto">
                <h1 className="text-center text-xl text-[#4c8779]">what personality type are you?</h1>
                {localSelectedGenres.length === 0 && (
                    <div className="text-right text-red-700">(at least one genre must be selected)</div>
                )}
                <div className="flex flex-col items-center gap-y-4">
                    <div className="flex flex-wrap justify-center gap-4">
                        {genres.map((genre) => {
                            const isSelected = localSelectedGenres?.some((g) => g.id === genre.id);

                            return (
                                <div
                                    onClick={() => genreSelected(genre)}
                                    className={`relative cursor-pointer w-32 h-32 font-semibold text-center rounded-lg outline border-[#CCD0CF] transition-all md:w-32 md:h-32 ${isSelected
                                        ? 'bg-[#4c8779] text-white border-[#4c8779]'
                                        : 'bg-[#CCD0CF] text-[#4c8779]'
                                        }`}
                                    key={genre.id}
                                >
                                    <div className="flex items-center justify-center w-full h-full text-xl md:text-xl">
                                        {isSelected ? genre.genre : genre.description}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        className={`bg-[#5cc6abeb] text-white py-2 px-4 rounded-lg hover:outline-slate-700 outline-slate-500 w-52 mt-4 transition-all sm:w-64 md:w-80 lg:w-96 ${localSelectedGenres.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        onClick={handleSubmit}
                        disabled={localSelectedGenres.length === 0 || loading}
                    >
                        {loading ? 'saving your selected genres' : 'done selecting??'}
                    </button>
                </div>
            </div>
        </>
    );
}

export default Genres;
