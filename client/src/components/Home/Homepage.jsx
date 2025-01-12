import { useEffect, useState } from 'react';
import { db } from '../../assets/firebaseConfig.js';
import { collection, getDocs, doc, getDoc, query, orderBy, limit } from 'firebase/firestore';
export default function HomePage() {

    const [topGenre, setTopGenre] = useState(null)
    const [topGenresList, setTopGenreList] = useState([])

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
        <>
    <div className="absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg bg-[#CCD0CF] shadow-lg w-[90%] max-w-4xl md:w-[80%] lg:w-[70%] h-fit max-h-[90%]">
        {topGenre && (
            <div className="top-genre-details w-full h-full">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#4c8779] mb-2 font-semibold">
                    people around here are more into
                </p>
                <span>
                    <span
                        style={{ color: topGenre.color }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                    >
                        {topGenre.genre} music
                    </span>
                </span>
                <img
                    src={topGenre.image}
                    alt={topGenre.genre}
                    className="w-32 h-32 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-64 lg:h-64 object-contain rounded-lg mx-auto my-4"
                />
                <p className="text-left text-sm sm:text-base md:text-lg lg:text-xl mt-2">
                    which makes them{" "}
                    <i>
                        <span
                            style={{ color: topGenre.color }}
                            className="text-sm sm:text-base md:text-xl lg:text-2xl"
                        >
                            {topGenre.description}
                        </span>
                    </i>
                </p>
                <b className="mt-2 italic text-base lg:text-xl sm:text-sm md:text-base text-center">
                    having {topGenre.atmosphere}
                </b>
            </div>
        )}

        <div className="list mt-6">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#4c8779] font-semibold">
                town is filled with merofiru from every corner
            </h3>
            <ul className="list-decimal mt-2 pl-4">
                {topGenresList.map((genre, index) => (
                    <li key={index} className="text-sm sm:text-base md:text-lg lg:text-xl">
                        <b>{genre.genreName}</b> is loved by {genre.userCount} merofiru
                    </li>
                ))}
            </ul>
        </div>
    </div>
</>

    );
}


// TODO: figure out the way (done, using blob and react-media-recorder) to enable voice messaages (will do in future acc to demand)