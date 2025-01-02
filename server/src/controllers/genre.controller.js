import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { db } from "../utils/firebaseAdmin.js";


const updateGenre = asyncHandler(async (req, res) => {
    const { selectedGenres, userId } = req.body;

    if (!selectedGenres || selectedGenres.length === 0) {
        return res.status(400).json(new ApiResponse(400, '', 'No genres provided'));
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        return res.status(404).json(new ApiResponse(404, '', 'User not found'));
    }

    try {
        const genreRefs = selectedGenres.map((genre) =>
            db.collection('genres').doc(genre.id)
        );

        const batch = db.batch();
        const invertedIndexRef = db.collection('invertedIndex');
        const previousGenres = userDoc.data()?.selectedGenre || [];

        for (const genreRef of previousGenres) {
            const indexDocRef = invertedIndexRef.doc(genreRef.id);
            const indexDoc = await indexDocRef.get();

            if (indexDoc.exists) {
                const users = indexDoc.data()?.users || [];
                const updatedUsers = users?.filter((id) => id !== userId);
                const userCount = updatedUsers.length

                batch.update(indexDocRef, { users: updatedUsers , userCount});
            }
        }

        for (const genre of selectedGenres) {
            const indexDocRef = invertedIndexRef.doc(genre.id);
            const indexDoc = await indexDocRef.get();

            if (indexDoc.exists) {
                const users = indexDoc.data()?.users || [];
                if (!users.includes(userId)) {
                    users.push(userId);
                }
                const userCount = users.length

                batch.update(indexDocRef, { users , userCount });
            } else {
                batch.set(indexDocRef, {
                    genreId: genre.id,
                    genreName: genre.genre,
                    users: [userId],
                    userCount : 1
                });
            }
        }

        batch.update(userRef, { selectedGenre: genreRefs });
        await batch.commit();

        return res.status(200).json(new ApiResponse(200, '', 'Genres updated successfully'));
    } catch (error) {
        console.error('Error updating genres:', error);
        return res.status(500).json(new ApiResponse(500, '', 'Something went wrong'));
    }
});




const findTopMatches = asyncHandler(async (req, res) => {

    const { userId } = req.body

    if (!userId) {
        return res.status(400).json(new ApiResponse(400, '', 'user id is required'))
    }
    const userRef = db.collection('users').doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
        return res.status(404).json(new ApiResponse(404, '', 'user not found'))
    }

    try {
        //fetching current user selected genre

        const userGenres = userDoc.data()?.selectedGenre || []
        const userBlockedList = userDoc.data()?.blockedUsers || []
        
        const usersFriends = userDoc.data()?.friends || []

        const genreData = []
        for (const genreRef of userGenres){
            const genreDoc = await genreRef.get()
           
            if(genreDoc.exists){
                genreData.push(genreDoc.data())
            }else{
                console.log('genre id ref not exits');
            }
        }
    
        const invertedIndexRef = db.collection('invertedIndex')
        const genreDocs = await Promise.all(
            genreData.map((genre) => invertedIndexRef.where('genreId' , '==' , genre.id).get())
        )

        const genereDocRefs = genreDocs.flatMap((docQuerySnap) => docQuerySnap.docs.map((doc) => doc.ref))

        const userMap = {}
        
        for (const genreRef of genereDocRefs){
            const invertedGenreDataRef = await genreRef.get()
            const invertedGenreData = invertedGenreDataRef.data()
            
            invertedGenreData?.users.forEach((otherUserId) =>{
                if (otherUserId != userId && !userBlockedList.includes(otherUserId) && !usersFriends.includes(otherUserId) ){
                    userMap[otherUserId] = (userMap[otherUserId] || 0) + 1
                }
            })  
        }

        // similarity score (jaccard similary)
        const totalGenres = genreData.length
        const similarityScore = await Promise.all(Object.entries(userMap).map(async ([otherUserId, intersection]) => {
            const otherUserRef = db.collection('users').doc(otherUserId)
            const otherUserDoc = await otherUserRef.get()

            const otherUserGenres = otherUserDoc.data()?.selectedGenre || []
            const union = totalGenres + otherUserGenres.length - intersection

            const similarity = (intersection / union) * 100

            return {
                userId: otherUserId,
                userName : otherUserDoc?.data()?.displayName,
                similarity: similarity.toFixed(2),
            }
        }))
        
        similarityScore.sort((a, b) => b.similarity - a.similarity).slice(0, 5)   
        const batch = db.batch()

        batch.set(userRef, { topMatches: similarityScore } , {merge : true})
        await batch.commit()

        return res.status(200).json(new ApiResponse(200, similarityScore, 'similar users fetched successfully'))

    } catch (error) {
        console.log(error);
        
        console.log('error finding similarity')
    }


})



export { updateGenre, findTopMatches }