import { db } from "../utils/firebaseAdmin"

class UserPreference{
    constructor(userId 
    ){
        this.userId = userId
        this.selectedGenre = []
        this.preferenceRef = db.collection('userPreference').doc(userId)
    }
}

export {UserPreference}