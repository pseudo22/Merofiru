import { useEffect, useState } from 'react';
import { db } from '../../assets/firebaseConfig.js';
import { collection, getDocs, doc, getDoc, query, orderBy, limit } from 'firebase/firestore';
export default function HomePage() {

    const [topGenre, setTopGenre] = useState(null)
    const [topGenresList , setTopGenreList] = useState([])

    useEffect(() => {
        async function getGenre() {
            const topGenreRef = collection(db, 'invertedIndex')
            const topGenreSnap = await getDocs(
                query(topGenreRef, orderBy('userCount', 'desc'), limit(3))
            )
            const topGenreList = topGenreSnap.docs.map((doc) => ({
                ...doc.data()
            }))
      
            setTopGenreList(topGenreList)

            const topGenreId = topGenreList[0].genreId

            if (!topGenreId) {
                console.log('no top genre')
            }
            const topGenreDescriptionRef = doc(db, 'genres', topGenreId)
            const genreDoc = await getDoc(topGenreDescriptionRef)
            
            if (genreDoc.exists()) {
                const topGenreData = genreDoc.data()
                setTopGenre(topGenreData)
            }
        }
        getGenre()

    }, [])

    return (
        <div className='absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#CCD0CF] shadow-lg md:w-[50%] w-full h-auto'>
            {topGenre && 
            (
                <div className="top-genre-details w-96">
                    <p className="text-xl text-[#4c8779] font-semibold">people around here are more into</p><span> <span style={{ color: topGenre.color }} className='text-4xl '>{topGenre.genre} music</span></span>
                    <img src={topGenre.image} alt={topGenre.genre} className="mt-2 w-full h-full object-contain rounded-lg" />
                    <p className="mt-2 ">which makes them <i><span style={{ color: topGenre.color }} className={`text-xl`}>{topGenre.description}</span></i></p>
                    <u className="mt-1 italic">having {topGenre.atmosphere}</u>
                </div>
            )}

            <div className="list mt-6">
                <h3 className="text-xl text-[#4c8779] font-semibold">town is filled with melophiles from every corner</h3>
                <ul className="list-decimal pl-4">
                    {topGenresList.map((genre, index) => (
                        <li key={index} className="mt-2">
                            <b>{genre.genreName}</b> is loved by {genre.userCount} melophiles
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}


// TODO: complete chat today anyhow, figure the way to enable voice messaages