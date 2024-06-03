import { db } from "../utils/firebaseAdmin"

class Friends{
    constructor(userId , status){
        this.userId = userId
        this.status = status // accept or reject boolean
        this.friendRef = db.collection('friends').doc(userId)
    }
}

export {Friends}