import React, { useEffect, useState , useRef } from 'react';
import { ApiClient } from '../../assets/axios';
import { db } from '../../assets/firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ToastContainer from '../Toast/ToastContainer';

function Genres() {
    const navigate = useNavigate();
    const { userId } = useSelector((state) => state.user);
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const toastRef = useRef()

    useEffect(() => {
        async function fetchGenresAndUserPreferences() {
            try {
                if (!userId) return;

                const genresCollection = collection(db, 'genres');
                const genresSnap = await getDocs(genresCollection);
                const allGenres = genresSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setGenres(allGenres);

                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    
                    const genreRefs = await userSnap.data()?.selectedGenre || [];
                    
                    if (Array.isArray(genreRefs)) {
                        const genreDocs = await Promise.all(
                            genreRefs.map(async (ref) => {
                                const genreSnap = await getDoc(ref);
                                return genreSnap.exists()
                                    ? { id: genreSnap.id, ...genreSnap.data() }
                                    : null;
                            })
                        );
                        
                        const validGenres = genreDocs.filter((genre) => genre !== null);
                        setSelectedGenres(validGenres);
                    } else {
                        setSelectedGenres([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching genres and user preferences:', error);
            }
        }

        fetchGenresAndUserPreferences();
    }, [userId]);
    

    const genreSelected = (genre) => {
        setSelectedGenres((prevSelectedGenres) => {
            const isSelected = prevSelectedGenres?.some((g) => g.id === genre.id);
            return isSelected
                ? prevSelectedGenres?.filter((g) => g.id !== genre.id)
                : [...prevSelectedGenres, genre];
        });
    };

    const handleSubmit = async () => {
        if (!selectedGenres.length) {
            toastRef.current.addToast('Please select at least one genre!');
            return;
        }

        try {
            const response = await ApiClient.post('/api/genre/update', {
                userId,
                selectedGenres,
            });

            toastRef.current.addToast(response?.data.message);
            navigate('/user/genre-matching');
        } catch (error) {
            console.error('Error submitting genres:', error);
            toastRef.current.addToast(error.response?.data.message || 'Something went wrong');
        }
    };

    return (
        <>
            <ToastContainer
                ref={toastRef}
            />
            <div className="absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#CCD0CF] shadow-lg md:w-[50%] w-full h-auto">
                <h1 className="text-center text-xl text-[#4c8779]">what personality type are you?</h1>
                {selectedGenres.length === 0 && (
                    <div className="text-right text-red-700">(at least one genre must be selected)</div>
                )}
                <div className="flex flex-col items-center gap-y-4">
                    <div className="flex flex-wrap justify-center gap-4">
                        {genres.map((genre) => {
                            const isSelected = selectedGenres?.some((g) => g.id === genre.id);
                            
                            return (
                                <div
                                    onClick={() => genreSelected(genre)}
                                    className={`relative cursor-pointer w-32 h-32 font-semibold text-center rounded-lg outline border-[#CCD0CF] transition-all md:w-32 md:h-32 ${
                                        isSelected
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
                        className={`bg-[#5cc6abeb] text-white py-2 px-4 rounded-lg hover:outline-slate-700 outline-slate-500 w-52 mt-4 transition-all sm:w-64 md:w-80 lg:w-96 ${
                            selectedGenres.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleSubmit}
                        disabled={selectedGenres.length === 0}
                    >
                        done selecting?
                    </button>
                </div>
            </div>
        </>
    );
}

export default Genres;
