import { db } from "../utils/firebaseAdmin"

class Messages{
    constructor(userId , seen){
        this.userId = userId
        this.seen = seen //boolean
        this.messageRef = db.collection('messages').doc(userId)
    }
}

export {Messages}